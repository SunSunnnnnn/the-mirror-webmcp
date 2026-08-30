import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { DEFAULT_DATASET_MODE, getKnowledgeDatasetConfig } from "../knowledge-config.js";
import { KnowledgeDataLoader } from "../data-loader.js";
import { getWorkDetailsData } from "../get-work-details.js";
import { exploreStylistFitData } from "../explore-stylist-fit.js";
import { registerSunSunWebMCPTools } from "../register-tools.js";

const accessLog = [];
const loader = new KnowledgeDataLoader({
  datasetMode: "public-sample",
  loadJson: async (url) => {
    accessLog.push(url.href);
    return JSON.parse(await readFile(fileURLToPath(url), "utf8"));
  },
});

function allKeys(value, output = []) {
  if (Array.isArray(value)) value.forEach((item) => allKeys(item, output));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nested]) => {
      output.push(key);
      allKeys(nested, output);
    });
  }
  return output;
}

test("public-sample is the only runtime dataset mode", () => {
  assert.equal(DEFAULT_DATASET_MODE, "public-sample");
  assert.equal(getKnowledgeDatasetConfig().mode, "public-sample");
  assert.ok(getKnowledgeDatasetConfig().baseUrl.href.endsWith("/data/public-sample/"));
  assert.throws(() => getKnowledgeDatasetConfig("another-mode"), TypeError);
});

test("loader requests only the public sample directory", async () => {
  accessLog.length = 0;
  const works = await loader.loadWorks();
  assert.equal(works.length, 4);
  assert.ok(accessLog.length >= 5);
  assert.ok(accessLog.every((url) => url.includes("/data/public-sample/")));
});

test("public sample has four cases, eight rules, and no media", async () => {
  const [works, rules] = await Promise.all([
    loader.loadWorks(),
    loader.read("rules/public-judgment-rules.json"),
  ]);
  assert.equal(works.length, 4);
  assert.equal(rules.rules.length, 8);
  assert.ok(works.every((work) => work.media.images.length === 0));
});

test("public records contain no hidden source-link fields", async () => {
  const works = await loader.loadWorks();
  const rules = await loader.read("rules/public-judgment-rules.json");
  const keys = [...allKeys(works), ...allKeys(rules)];
  const disallowedFragments = ["derived", "source"].map((value) => value.toLowerCase());
  assert.ok(keys.every((key) => !disallowedFragments.some((fragment) => key.toLowerCase().includes(fragment))));
});

test("only public case identifiers are accepted", async () => {
  const result = await getWorkDetailsData({ work_id: "public-case-003" }, loader);
  assert.equal(result.work_id, "public-case-003");
  await assert.rejects(
    getWorkDetailsData({ work_id: "legacy-case-003" }, loader),
    TypeError,
  );
});

test("demo journey returns designed-visibility evidence", async () => {
  const result = await exploreStylistFitData({
    desired_change: ["不再只是普通发色"],
    desired_experience: ["上班克制，私下有个性"],
    experiences_to_avoid: ["上班太夸张", "不想经常补染"],
    maintenance_willingness: "低频",
    visibility_boundary: "上班扎发克制，私下披发明显",
    work_and_life_constraints: ["上班需要扎发"],
    identity_expression: ["工作与私人状态不同"],
  }, loader);
  const ids = result.relevant_cases.map((item) => item.work_id);
  assert.equal(result.fit_assessment, "strong_fit_evidence");
  assert.ok(ids.includes("public-case-003"));
  assert.ok(ids.includes("public-case-004"));
});

test("all case detail output remains public and media-free", async () => {
  const outputs = await Promise.all([
    "public-case-001", "public-case-002", "public-case-003", "public-case-004",
  ].map((work_id) => getWorkDetailsData({ work_id }, loader)));
  const serialized = JSON.stringify(outputs);
  const returnedIds = serialized.match(/public-case-[0-9]{3}/g) || [];
  assert.ok(returnedIds.length > 0);
  assert.ok(outputs.every((item) => item.publication_safe_media.length === 0));
  assert.ok(allKeys(outputs).every((key) => !key.toLowerCase().includes("derived")));
});

test("exactly four tools register against the public sample", async () => {
  const registered = [];
  const modelContext = { async registerTool(tool) { registered.push(tool); } };
  const result = await registerSunSunWebMCPTools({ modelContext, loader });
  assert.deepEqual(result.registered, [
    "search_works", "get_work_details", "explore_stylist_fit", "build_consultation_brief",
  ]);
  assert.equal(registered.length, 4);
});
