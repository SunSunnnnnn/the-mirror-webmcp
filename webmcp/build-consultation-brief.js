import { knowledgeDataLoader } from "./data-loader.js";
import {
  boundaryOutput,
  caseReplicabilityWarning,
  cleanString,
  cleanStringArray,
  selfReportedBackground,
  toWebMCPResult,
} from "./safety.js";

function makeMatchQuestions(input) {
  const questions = [...cleanStringArray(input.unresolved_personal_questions)];
  if (cleanStringArray(input.underlying_need).length === 0) {
    questions.push("这次改变真正想获得或避免的体验是什么？");
  }
  if (!input.maintenance_willingness) {
    questions.push("你愿意多久维护一次？");
  }
  if (!input.visibility_and_identity_boundary) {
    questions.push("在工作、私人、扎发与披发状态中，你可接受的可见度分别是什么？");
  }
  return [...new Set(questions)].slice(0, 6).map((question) => ({
    question,
    unknown_type: "match_stage_unknown",
  }));
}

export async function buildConsultationBriefData(input = {}, loader = knowledgeDataLoader) {
  if (!cleanString(input.client_intention)) {
    throw new TypeError("client_intention is required.");
  }

  const [works, boundary] = await Promise.all([
    loader.loadWorks(),
    loader.loadSystemBoundary(),
  ]);
  const worksById = new Map(works.map((work) => [work.work_id, work]));
  const reactions = Array.isArray(input.relevant_case_reactions)
    ? input.relevant_case_reactions.slice(0, 5)
    : [];
  const relevantCases = reactions
    .filter((reaction) => worksById.has(reaction?.work_id))
    .map((reaction) => ({
      work_id: reaction.work_id,
      why_it_resonated: cleanString(reaction.why_it_resonated),
      technical_replicability_warning: caseReplicabilityWarning(reaction.work_id),
    }));
  const remoteBoundary = boundaryOutput(boundary);

  return {
    brief_type: "pre_consultation_intent_brief",
    intention: cleanString(input.client_intention),
    stated_request: cleanStringArray(input.stated_request),
    underlying_need: cleanStringArray(input.underlying_need),
    desired_change: cleanStringArray(input.desired_change),
    desired_experience: cleanStringArray(input.desired_experience),
    avoided_experience: cleanStringArray(input.things_to_avoid),
    lifestyle_and_identity_context: {
      lifestyle_constraints: cleanStringArray(input.lifestyle_constraints),
      visibility_and_identity_boundary: cleanString(input.visibility_and_identity_boundary) || null,
    },
    maintenance_expectations: cleanString(input.maintenance_willingness) || null,
    relevant_sunsun_cases: relevantCases,
    why_those_cases_resonated: relevantCases.map((item) => item.why_it_resonated),
    match_stage_questions: makeMatchQuestions(input),
    self_reported_consultation_background: selfReportedBackground(
      input.self_reported_chemical_history,
    ),
    requires_in_person_assessment: remoteBoundary.requires_in_person_assessment,
    cannot_conclude_remotely: remoteBoundary.cannot_conclude_remotely,
    explicit_uncertainty_statement: "访客自述尚未经过现场观察、触摸、测试和化学历史核验，不能据此形成技术可行性结论。",
    technical_promise_notice: "No technical result is promised before in-person assessment.",
  };
}

export async function executeBuildConsultationBrief(input, loader = knowledgeDataLoader) {
  return toWebMCPResult(await buildConsultationBriefData(input, loader));
}
