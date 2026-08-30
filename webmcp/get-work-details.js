import { knowledgeDataLoader } from "./data-loader.js";
import {
  boundaryOutput,
  caseReplicabilityWarning,
  consultationSafeWork,
  historicalUnknowns,
  isSupportedCaseId,
  toWebMCPResult,
} from "./safety.js";

function confirmedArray(value) {
  return Array.isArray(value) ? value : [];
}

export async function getWorkDetailsData(input = {}, loader = knowledgeDataLoader) {
  if (!isSupportedCaseId(input.work_id)) {
    throw new TypeError("work_id must be a supported public sample case ID.");
  }

  const [work, boundary] = await Promise.all([
    loader.getWork(input.work_id),
    loader.loadSystemBoundary(),
  ]);
  if (!work) throw new RangeError(`Unknown work_id: ${input.work_id}`);

  const safe = consultationSafeWork(work);
  const remoteBoundary = boundaryOutput(boundary);
  const statedRequest = work.underlying_need?.stated_request
    || work.context?.psychological_context?.stated_request
    || [];
  const underlyingNeed = work.underlying_need?.underlying_need
    || work.context?.psychological_context?.underlying_need
    || [];
  const productiveConstraints = confirmedArray(safe.productive_constraints?.items);
  const constraints = [
    ...confirmedArray(work.design_problem?.tensions),
    ...productiveConstraints.map((item) => item.constraint).filter(Boolean),
  ];

  return {
    work_id: work.work_id,
    context: safe.context,
    stated_request: statedRequest,
    underlying_need: underlyingNeed,
    design_problem: safe.design_problem,
    constraints: [...new Set(constraints)],
    productive_constraints: productiveConstraints,
    judgment: safe.judgment,
    design_moves: safe.design_moves,
    hair_integrity_decision: safe.hair_integrity,
    identity_and_visibility: safe.identity_expression,
    evolution: safe.temporal_aesthetics,
    provenance: safe.provenance,
    unknowns: {
      historical_record_unknowns: historicalUnknowns(work),
      visitor_assessment_not_inferred: remoteBoundary.requires_in_person_assessment,
    },
    excluded_fields: [
      "optional_professional_notes",
      "private source narratives and provenance references",
      "publication-sensitive media",
    ],
    historical_case_disclaimer: "这是 SunSun 对一位真实客人当时情况所作判断的历史记录。",
    not_evidence_of_visitor_technical_feasibility: caseReplicabilityWarning(work.work_id),
    case_use_warning: `${caseReplicabilityWarning(work.work_id)} 访客自述不能代替现场检查。`,
    publication_safe_media: safe.publication_safe_media,
    public_url: safe.public_url,
    requires_in_person_assessment: remoteBoundary.requires_in_person_assessment,
    cannot_conclude_remotely: remoteBoundary.cannot_conclude_remotely,
  };
}

export async function executeGetWorkDetails(input, loader = knowledgeDataLoader) {
  return toWebMCPResult(await getWorkDetailsData(input, loader));
}
