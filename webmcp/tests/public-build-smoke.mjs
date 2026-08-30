import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const distRoot = resolve(process.argv[2]);
const moduleRoot = pathToFileURL(`${distRoot}/webmcp/`);
const dataRoot = pathToFileURL(`${distRoot}/data/public-sample/`);
const { KnowledgeDataLoader } = await import(new URL("data-loader.js", moduleRoot));
const { exploreStylistFitData } = await import(new URL("explore-stylist-fit.js", moduleRoot));
const { getWorkDetailsData } = await import(new URL("get-work-details.js", moduleRoot));
const { buildConsultationBriefData } = await import(new URL("build-consultation-brief.js", moduleRoot));

const loadedUrls = [];
const loader = new KnowledgeDataLoader({
  datasetMode: "public-sample",
  baseUrl: dataRoot,
  loadJson: async (url) => {
    loadedUrls.push(url.href);
    return JSON.parse(await readFile(url, "utf8"));
  },
});

const fit = await exploreStylistFitData({
  desired_change: ["不再只是普通发色"],
  desired_experience: ["上班克制，私下有个性"],
  experiences_to_avoid: ["上班太夸张", "不想经常补染"],
  maintenance_willingness: "低频",
  visibility_boundary: "上班扎发克制，私下披发明显",
  work_and_life_constraints: ["上班需要扎发"],
  identity_expression: ["工作与私人状态不同"],
}, loader);
assert.equal(fit.fit_assessment, "strong_fit_evidence");
assert.ok(fit.relevant_cases.some((item) => item.work_id === "public-case-003"));
assert.ok(fit.relevant_cases.some((item) => item.work_id === "public-case-004"));

const details = await getWorkDetailsData({ work_id: "public-case-003" }, loader);
assert.deepEqual(details.publication_safe_media, []);

const brief = await buildConsultationBriefData({
  client_intention: "判断是否值得预约",
  stated_request: ["上班不明显、私下不普通"],
  underlying_need: ["保留不同身份状态的表达空间"],
  desired_change: ["从普通发色进入可设计可见度的表达"],
  desired_experience: ["工作安心，私下有个性"],
  things_to_avoid: ["频繁维护"],
  relevant_case_reactions: [{ work_id: "public-case-003", why_it_resonated: "身份不必二选一" }],
}, loader);
assert.equal(brief.brief_type, "pre_consultation_intent_brief");
assert.equal(brief.technical_promise_notice, "No technical result is promised before in-person assessment.");
assert.ok(loadedUrls.every((url) => url.includes("/data/public-sample/")));
console.log("Public-only release smoke test: PASS");
