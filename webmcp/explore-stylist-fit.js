import { knowledgeDataLoader } from "./data-loader.js";
import { searchWorksData, concernsFromFreeText } from "./search-works.js";
import {
  boundaryOutput,
  caseReplicabilityWarning,
  cleanStringArray,
  selfReportedBackground,
  toWebMCPResult,
} from "./safety.js";

const GUARANTEE_LANGUAGE = [
  "保证", "一定能", "漂到", "几度", "十度", "9度", "10度", "完全复刻", "一模一样", "配方", "色号",
  "definitely", "same result", "exact bleach level", "formula", "technical prescription", "replicate", "reproduce",
];

function combinedText(input) {
  return [
    ...cleanStringArray(input.desired_change),
    ...cleanStringArray(input.desired_experience),
    ...cleanStringArray(input.experiences_to_avoid),
    ...cleanStringArray(input.work_and_life_constraints),
    ...cleanStringArray(input.identity_expression),
    input.maintenance_willingness,
    input.visibility_boundary,
    input.experimental_openness,
  ].filter(Boolean).join(" ");
}

function inferConcerns(input, vocabulary) {
  const text = combinedText(input);
  const inferred = concernsFromFreeText(text, vocabulary);
  const explicit = Array.isArray(input.reference_concerns)
    ? input.reference_concerns
    : [];
  return [...new Set([...inferred, ...explicit])];
}

function matchStageQuestions(input) {
  const questions = [];
  if (!input.maintenance_willingness) {
    questions.push("你希望多久维护或补染一次，最多能接受多高频率？");
  }
  if (!input.visibility_boundary) {
    questions.push("在工作、私人、扎发与披发状态中，你分别希望颜色被看见到什么程度？");
  }
  if (cleanStringArray(input.experiences_to_avoid).length === 0) {
    questions.push("相比某个颜色名称，你最想避免再次经历什么？");
  }
  if (cleanStringArray(input.identity_expression).length === 0) {
    questions.push("你希望这个变化替你表达哪一部分自己？");
  }
  if (!input.experimental_openness) {
    questions.push("当安全或生活限制与原目标冲突时，你愿意探索不同的视觉路径吗？");
  }
  return questions.slice(0, 4).map((question) => ({
    question,
    unknown_type: "match_stage_unknown",
  }));
}

export async function exploreStylistFitData(input = {}, loader = knowledgeDataLoader) {
  const text = combinedText(input);
  const normalizedText = text.toLowerCase();
  const vocabulary = await loader.loadConcernVocabulary();
  const concerns = inferConcerns(input, vocabulary);
  const hasSubstantiveInput = text.trim().length > 0;
  const asksForGuarantee = GUARANTEE_LANGUAGE.some((phrase) => normalizedText.includes(phrase));
  const [boundary, searchResult] = await Promise.all([
    loader.loadSystemBoundary(),
    concerns.length > 0
      ? searchWorksData({ concerns, free_text_concern: text, limit: 3 }, loader)
      : Promise.resolve({ matches: [] }),
  ]);
  const remoteBoundary = boundaryOutput(boundary);
  const relevantCases = searchResult.matches.map((match) => ({
    work_id: match.work_id,
    relevance: match.why_this_case_is_relevant,
    relevant_judgment_dimensions: match.relevant_judgment_dimensions,
    technical_replicability_warning: caseReplicabilityWarning(match.work_id),
  }));
  const dimensions = [...new Set(
    relevantCases.flatMap((item) => item.relevant_judgment_dimensions),
  )];

  let fitAssessment = "unclear_fit";
  if (!hasSubstantiveInput) fitAssessment = "insufficient_evidence";
  else if (asksForGuarantee && concerns.length === 0) fitAssessment = "weak_fit";
  else if (relevantCases.length >= 2 && concerns.length >= 2) fitAssessment = "strong_fit_evidence";
  else if (relevantCases.length > 0) fitAssessment = "possible_fit";
  else fitAssessment = "insufficient_evidence";

  const whyMayFit = relevantCases.length > 0
    ? [
        `现有案例对 ${dimensions.join("、")} 提供了直接的 SunSun 判断证据。`,
        "这些证据可用于判断专业方法是否契合，不用于承诺相同颜色或技术结果。",
      ]
    : [];
  const whyMayNotFit = [];
  if (!hasSubstantiveInput || relevantCases.length === 0) {
    whyMayNotFit.push("当前输入与可用案例之间没有足够明确的判断证据，不能强行判定适合。");
  }
  if (asksForGuarantee) {
    whyMayNotFit.push("如果核心期待是远程保证漂浅级数、复刻结果或给出配方，这超出 SunSun WebMCP 的产品边界。公开历史案例只提供 judgment evidence，不是可复制的技术模板。" );
  }
  if (cleanStringArray(input.desired_experience).length === 0) {
    whyMayNotFit.push("尚未说明真正想获得的体验，stylist-fit 结论精度有限。" );
  }

  return {
    fit_assessment: fitAssessment,
    relevant_judgment_dimensions: dimensions,
    why_sunsun_may_fit: whyMayFit,
    why_sunsun_may_not_fit: whyMayNotFit,
    relevant_cases: relevantCases,
    match_stage_questions: matchStageQuestions(input),
    self_reported_consultation_background: selfReportedBackground(
      input.self_reported_chemical_history,
    ),
    requires_in_person_assessment: remoteBoundary.requires_in_person_assessment,
    cannot_conclude_remotely: remoteBoundary.cannot_conclude_remotely,
    fit_assessment_scope: "只评估访客关心的问题与 SunSun 已记录判断方式之间的契合证据；不提供发型处方或技术可行性判断。",
  };
}

export async function executeExploreStylistFit(input, loader = knowledgeDataLoader) {
  return toWebMCPResult(await exploreStylistFitData(input, loader));
}
