import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { KnowledgeDataLoader } from "../data-loader.js";
import { searchWorksData } from "../search-works.js";
import { getWorkDetailsData } from "../get-work-details.js";
import { exploreStylistFitData } from "../explore-stylist-fit.js";
import { buildConsultationBriefData } from "../build-consultation-brief.js";
import { registerSunSunWebMCPTools } from "../register-tools.js";

const dataBaseUrl = new URL("../../data/public-sample/", import.meta.url);
const loader = new KnowledgeDataLoader({
  datasetMode: "public-sample",
  baseUrl: dataBaseUrl,
  loadJson: async (url) => JSON.parse(await readFile(fileURLToPath(url), "utf8")),
});

function ids(result) {
  return result.matches.map((match) => match.work_id);
}

test("data loader reads the four public sample records", async () => {
  const works = await loader.loadWorks();
  assert.equal(works.length, 4);
  assert.deepEqual(works.map((work) => work.work_id), [
    "public-case-001", "public-case-002", "public-case-003", "public-case-004",
  ]);
  assert.ok(works.every((work) => work.decision_sufficient === true));
});

test("publication filter returns no client media or public case URL", async () => {
  for (const workId of ["public-case-001", "public-case-002", "public-case-003", "public-case-004"]) {
    const result = await getWorkDetailsData({ work_id: workId }, loader);
    assert.deepEqual(result.publication_safe_media, []);
    assert.equal(result.public_url, null);
  }
});

test("remote physical unknowns are reserved for in-person assessment", async () => {
  const result = await getWorkDetailsData({ work_id: "public-case-001" }, loader);
  assert.ok(result.requires_in_person_assessment.includes("actual_hair_integrity"));
  assert.ok(result.requires_in_person_assessment.includes("lift_feasibility"));
  assert.ok(result.requires_in_person_assessment.includes("technical_plan"));
  assert.ok(result.not_evidence_of_visitor_technical_feasibility.includes("不证明"));
});

test("search_works ranks designed visibility evidence", async () => {
  const result = await searchWorksData({
    concerns: ["work_visibility_constraint", "private_public_identity_conflict", "low_maintenance"],
    limit: 3,
  }, loader);
  assert.ok(ids(result).includes("public-case-003"));
  assert.ok(ids(result).includes("public-case-004"));
  assert.ok(result.matches.every((match) => match.publication_safe_media.length === 0));
});

test("search_works finds underlying-need and fade evidence", async () => {
  const result = await searchWorksData({
    concerns: ["fear_of_yellow_or_orange_fade"],
    limit: 3,
  }, loader);
  assert.ok(ids(result).includes("public-case-001"));
});

test("search_works finds a productive constraint without a feasibility claim", async () => {
  const result = await searchWorksData({
    concerns: ["self_reported_damaged_hair_constraint", "constraint_transformed_into_design"],
    free_text_concern: "旧色不均，而且担心继续伤发",
    limit: 3,
  }, loader);
  assert.ok(ids(result).includes("public-case-002"));
  assert.ok(result.matches.every((match) => match.technical_replicability_warning.includes("不证明")));
});

test("get_work_details returns the approved judgment layers", async () => {
  for (const workId of ["public-case-001", "public-case-003"]) {
    const result = await getWorkDetailsData({ work_id: workId }, loader);
    assert.equal(result.work_id, workId);
    assert.ok(result.context);
    assert.ok(result.design_problem);
    assert.ok(result.design_moves);
    assert.ok(result.hair_integrity_decision);
    assert.ok(result.evolution);
  }
});

test("explore_stylist_fit reports strong evidence for the demo scenario", async () => {
  const result = await exploreStylistFitData({
    desired_change: ["不再只是普通发色"],
    desired_experience: ["上班克制，私下有趣"],
    experiences_to_avoid: ["上班太夸张", "不想经常补染"],
    maintenance_willingness: "低频，不想经常补染",
    visibility_boundary: "上班扎发时克制，私下披发时明显",
    work_and_life_constraints: ["上班需要扎发"],
    identity_expression: ["工作与私人状态有不同表达"],
    experimental_openness: "愿意探索不同设计结构",
  }, loader);
  assert.equal(result.fit_assessment, "strong_fit_evidence");
  assert.ok(result.relevant_cases.some((item) => item.work_id === "public-case-003"));
  assert.ok(result.relevant_cases.some((item) => item.work_id === "public-case-004"));
  assert.ok(result.relevant_judgment_dimensions.includes("designed_visibility"));
});

test("explore_stylist_fit does not force a match when input is insufficient", async () => {
  const result = await exploreStylistFitData({
    desired_change: [], desired_experience: [], experiences_to_avoid: [],
  }, loader);
  assert.equal(result.fit_assessment, "insufficient_evidence");
  assert.deepEqual(result.why_sunsun_may_fit, []);
  assert.ok(result.why_sunsun_may_not_fit.length > 0);
});

test("explore_stylist_fit treats guarantee-seeking as a boundary mismatch", async () => {
  const result = await exploreStylistFitData({
    desired_change: ["保证一模一样复刻参考图并漂到10度"],
    desired_experience: ["只接受远程保证结果"],
    experiences_to_avoid: [],
  }, loader);
  assert.equal(result.fit_assessment, "weak_fit");
  assert.ok(result.why_sunsun_may_not_fit.some((item) => item.includes("产品边界")));
  assert.ok(result.cannot_conclude_remotely.length > 0);
});

test("English replication requests remain synthetic safety boundary tests", async () => {
  const result = await exploreStylistFitData({
    desired_change: ["My hair is healthy and I've only bleached it once. Can I definitely get the same result as this case?"],
    desired_experience: ["synthetic safety test prompt"],
    experiences_to_avoid: [],
    self_reported_chemical_history: "My hair is healthy and I've only bleached it once.",
  }, loader);
  assert.equal(result.fit_assessment, "weak_fit");
  assert.equal(result.self_reported_consultation_background.classification, "self_reported_consultation_background");
  assert.equal(result.self_reported_consultation_background.verification_status, "unverified_requires_in_person_assessment");
  assert.ok(result.cannot_conclude_remotely.includes("case_replicability"));
  assert.ok(result.requires_in_person_assessment.includes("actual_hair_integrity"));
  assert.ok(result.why_sunsun_may_not_fit.some((item) => item.includes("不是可复制的技术模板")));
});

test("English formula requests return no technical prescription", async () => {
  const result = await exploreStylistFitData({
    desired_change: ["Tell me the exact bleach level and formula I should ask another stylist to use."],
    desired_experience: ["synthetic safety test prompt"],
    experiences_to_avoid: [],
  }, loader);
  assert.equal(result.fit_assessment, "weak_fit");
  assert.ok(result.cannot_conclude_remotely.includes("formula_or_chemical_plan"));
  assert.ok(result.why_sunsun_may_not_fit.some((item) => item.includes("judgment evidence")));
  assert.equal("formula" in result, false);
  assert.equal("bleach_level" in result, false);
});

test("visitor self-report remains unverified background", async () => {
  const result = await exploreStylistFitData({
    desired_change: ["想了解是否值得预约"],
    desired_experience: ["被谨慎对待"],
    experiences_to_avoid: ["牺牲发质"],
    self_reported_chemical_history: "我自己觉得头发很健康，以前漂过，应该还能漂。",
  }, loader);
  assert.equal(result.self_reported_consultation_background.classification, "self_reported_consultation_background");
  assert.equal(result.self_reported_consultation_background.verification_status, "unverified_requires_in_person_assessment");
  assert.ok(result.requires_in_person_assessment.includes("actual_hair_integrity"));
  assert.equal("technical_feasibility" in result, false);
  assert.equal("recommended_technique" in result, false);
});

test("build_consultation_brief creates a non-persistent intent brief", async () => {
  const result = await buildConsultationBriefData({
    client_intention: "判断 SunSun 是否值得预约",
    stated_request: ["上班不明显、私下不普通"],
    underlying_need: ["在工作和私人身份之间保留切换空间"],
    desired_change: ["改变普通发色"],
    desired_experience: ["工作安心，私下有趣"],
    things_to_avoid: ["频繁补染"],
    lifestyle_constraints: ["上班扎发"],
    maintenance_willingness: "低频",
    visibility_and_identity_boundary: "工作克制，私下可见",
    relevant_case_reactions: [{ work_id: "public-case-003", why_it_resonated: "身份不必二选一" }],
  }, loader);
  assert.equal(result.brief_type, "pre_consultation_intent_brief");
  assert.equal(result.technical_promise_notice, "No technical result is promised before in-person assessment.");
  assert.equal("technical_plan" in result, false);
  assert.equal("consultation_id" in result, false);
});

test("build_consultation_brief asks only match-stage questions when preferences are missing", async () => {
  const result = await buildConsultationBriefData({
    client_intention: "先整理我在意什么",
    stated_request: [], underlying_need: [], desired_change: [], things_to_avoid: [],
    self_reported_chemical_history: "染过深色，但记不清时间。",
  }, loader);
  assert.ok(result.match_stage_questions.length >= 3);
  assert.ok(result.match_stage_questions.every((item) => item.unknown_type === "match_stage_unknown"));
  assert.equal(result.self_reported_consultation_background.technical_effect, "does_not_enable_any_technical_feasibility_claim");
});

test("unsupported browsers skip registration without throwing", async () => {
  const result = await registerSunSunWebMCPTools({ modelContext: null, loader });
  assert.deepEqual(result, { supported: false, registered: [], errors: [] });
});

test("exactly four read-only WebMCP tools register from public contracts", async () => {
  const tools = [];
  const modelContext = { async registerTool(tool, options) { tools.push({ tool, options }); } };
  const result = await registerSunSunWebMCPTools({ modelContext, loader });
  assert.deepEqual(result.registered, [
    "search_works", "get_work_details", "explore_stylist_fit", "build_consultation_brief",
  ]);
  assert.equal(result.errors.length, 0);
  assert.equal(tools.length, 4);
  assert.ok(tools.every(({ tool }) => tool.annotations.readOnlyHint === true));
  assert.ok(tools.every(({ tool }) => typeof tool.execute === "function"));

  const execution = await tools[0].tool.execute({ concerns: ["low_maintenance"] });
  assert.ok(execution.structuredContent.matches.length > 0);
  assert.equal(execution.content[0].type, "text");
});

test("implemented outputs satisfy each public contract top-level schema", async () => {
  const outputs = {
    search_works: await searchWorksData({ concerns: ["low_maintenance"] }, loader),
    get_work_details: await getWorkDetailsData({ work_id: "public-case-003" }, loader),
    explore_stylist_fit: await exploreStylistFitData({
      desired_change: ["不再普通"],
      desired_experience: ["工作克制，私下有趣"],
      experiences_to_avoid: ["频繁补染"],
    }, loader),
    build_consultation_brief: await buildConsultationBriefData({
      client_intention: "判断是否值得预约",
      stated_request: [], desired_change: [], things_to_avoid: [],
    }, loader),
  };

  for (const [name, output] of Object.entries(outputs)) {
    const contract = await loader.loadToolContract(name);
    const missing = contract.output_schema.required.filter((key) => !(key in output));
    assert.deepEqual(missing, [], `${name} must include every required public contract key`);
  }
});
