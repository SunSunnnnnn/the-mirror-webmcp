import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const auditRoot = resolve(process.argv[2] || repositoryRoot);
const skippedDirectories = new Set([".git", "node_modules"]);
if (auditRoot === repositoryRoot) skippedDirectories.add("dist");

const textExtensions = new Set([
  "", ".css", ".html", ".js", ".json", ".md", ".mjs", ".sh", ".txt",
]);
const mediaExtensions = new Set([
  ".avif", ".gif", ".jpeg", ".jpg", ".mov", ".mp3", ".mp4", ".png", ".svg", ".webp",
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function hiddenKey(parts) {
  return parts.join("_");
}

const forbiddenLiterals = [
  hiddenKey(["derived", "from", "private", "work", "id"]),
  hiddenKey(["derived", "from", "private", "rule", "id"]),
  hiddenKey(["source", "narrative", "zh"]),
  hiddenKey(["source", "ref"]),
  hiddenKey(["source", "refs"]),
  ["private", "master"].join("-"),
  ["data", "design-knowledge"].join("/"),
  ["v0", "2", "1"].join("."),
  [String.fromCharCode(99, 111, 109, 112, 101, 116, 105, 116, 105, 111, 110), "case"].join("-"),
];

const secretPatterns = [
  { label: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/g },
  { label: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { label: "OpenAI-style token", pattern: /sk-[A-Za-z0-9_-]{20,}/g },
  { label: "authorization bearer", pattern: /Authorization\s*:\s*Bearer\s+[A-Za-z0-9._-]{12,}/gi },
  { label: "PEM key", pattern: new RegExp("-".repeat(5) + "BEGIN " + "PRIVATE KEY" + "-".repeat(5), "g") },
];

function collectKeys(value, output = []) {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, output));
  else if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      output.push(key);
      collectKeys(nested, output);
    }
  }
  return output;
}

function fail(message) {
  throw new Error(`PUBLIC RELEASE AUDIT FAILED: ${message}`);
}

const rootStats = await stat(auditRoot);
if (!rootStats.isDirectory()) fail("audit target is not a directory");

const files = await walk(auditRoot);
const relativeFiles = files.map((file) => relative(auditRoot, file));
const mediaFiles = relativeFiles.filter((file) => mediaExtensions.has(extname(file).toLowerCase()));
if (mediaFiles.length > 0) fail(`unexpected media files: ${mediaFiles.join(", ")}`);

for (const file of files) {
  const extension = extname(file).toLowerCase();
  if (!textExtensions.has(extension)) continue;
  const content = await readFile(file, "utf8");
  const displayPath = relative(auditRoot, file);

  for (const literal of forbiddenLiterals) {
    if (content.includes(literal)) fail(`forbidden legacy or source-link string in ${displayPath}`);
  }
  if (/\bwork-00[1-9]\b/.test(content)) fail(`legacy case identifier in ${displayPath}`);
  if (new RegExp("/" + "Users" + "/").test(content)) fail(`local filesystem path in ${displayPath}`);
  if (new RegExp("[A-Za-z]:" + "\\\\" + "Users" + "\\\\", "i").test(content)) {
    fail(`local filesystem path in ${displayPath}`);
  }
  for (const { label, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) fail(`${label} pattern in ${displayPath}`);
  }

  if (extension === ".json") {
    try {
      JSON.parse(content);
    } catch {
      fail(`invalid JSON in ${displayPath}`);
    }
  }
}

const dataRoot = resolve(auditRoot, "data/public-sample");
const manifest = JSON.parse(await readFile(resolve(dataRoot, "manifest.json"), "utf8"));
if (manifest.case_count !== 4 || manifest.public_rule_count !== 8 || manifest.media_count !== 0) {
  fail("public sample manifest counts are incorrect");
}
if (manifest.license !== "CC-BY-4.0") fail("public sample license is not declared");

const index = JSON.parse(await readFile(resolve(dataRoot, "works/index.json"), "utf8"));
const expectedIds = ["public-case-001", "public-case-002", "public-case-003", "public-case-004"];
if (JSON.stringify(index.records.map((record) => record.work_id)) !== JSON.stringify(expectedIds)) {
  fail("public case identifiers are incorrect");
}

for (const entry of index.records) {
  const record = JSON.parse(await readFile(resolve(dataRoot, "works", entry.path.replace(/^\.\//, "")), "utf8"));
  if (record.media?.images?.length !== 0) fail(`record ${entry.work_id} contains media`);
  if (collectKeys(record).some((key) => key.toLowerCase().includes("derived"))) {
    fail(`record ${entry.work_id} contains a hidden source-link field`);
  }
}

const rules = JSON.parse(await readFile(resolve(dataRoot, "rules/public-judgment-rules.json"), "utf8"));
if (rules.rules.length !== 8) fail("public rule count is incorrect");
if (collectKeys(rules).some((key) => key.toLowerCase().includes("derived"))) {
  fail("public rules contain hidden source-link fields");
}

console.log(`Public release audit: PASS (${relativeFiles.length} files checked)`);
console.log("- four public cases / eight public rules / zero media");
console.log("- no legacy identifiers, hidden source links, local paths, or credential patterns");
