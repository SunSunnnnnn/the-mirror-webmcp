const PHYSICAL_CLAIM_FIELDS = Object.freeze([
  "actual_hair_integrity",
  "chemical_history_verification",
  "regional_damage_distribution",
  "wet_hair_elasticity",
  "pigment_buildup",
  "lift_feasibility",
  "scalp_and_strand_condition",
  "technical_plan",
]);

function clone(value) {
  if (value === undefined) return undefined;
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

const SENSITIVE_KEYS = new Set([
  "consent_note",
]);

function stripSensitiveKeys(value) {
  if (Array.isArray(value)) return value.map(stripSensitiveKeys);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEYS.has(key))
      .map(([key, nestedValue]) => [key, stripSensitiveKeys(nestedValue)]),
  );
}

function safeClone(value) {
  return stripSensitiveKeys(clone(value));
}

export function publicationSafeMedia(work) {
  const publication = work.publication || {};
  const recordIsPublic = publication.record === "public";
  const allImageTypesArePublic =
    publication.face_images === "public" && publication.full_images === "public";

  if (!recordIsPublic || !allImageTypesArePublic) return [];

  return (work.media?.images || []).map((image) => ({
    src: image.src,
    alt: image.alt_zh || "SunSun 历史作品记录",
  }));
}

export function publicationSafeUrl(work) {
  if (work.publication?.record !== "public") return null;
  return typeof work.public_url === "string" ? work.public_url : null;
}

export function safeProvenance(work) {
  return {
    authority: work.provenance?.authority || "unknown",
    review_status: work.provenance?.review_status || "unknown",
    inference_policy: work.provenance?.inference_policy || "unknown",
    source_type: "SunSun-authored historical work record",
  };
}

export function consultationSafeWork(work) {
  return {
    work_id: work.work_id,
    client_journey: safeClone(work.client_journey),
    context: safeClone(work.context),
    design_problem: safeClone(work.design_problem),
    underlying_need: safeClone(work.underlying_need),
    productive_constraints: safeClone(work.productive_constraints),
    judgment: safeClone(work.judgment),
    design_moves: safeClone(work.design_moves),
    hair_integrity: safeClone(work.hair_integrity),
    identity_expression: safeClone(work.identity_expression),
    temporal_aesthetics: safeClone(work.temporal_aesthetics),
    visual_result: safeClone(work.visual_result),
    provenance: safeProvenance(work),
    publication_safe_media: publicationSafeMedia(work),
    public_url: publicationSafeUrl(work),
  };
}

export function historicalUnknowns(work) {
  const values = [
    ...(work.context?.hair_context?.unknown_risks || []),
    ...(work.hair_integrity?.uncertain_risks || []),
  ];

  return [...new Set(values.filter(Boolean))];
}

export function boundaryOutput(boundary) {
  return {
    requires_in_person_assessment: [
      ...new Set([
        ...(boundary.requires_in_person_assessment || []),
        ...PHYSICAL_CLAIM_FIELDS,
      ]),
    ],
    cannot_conclude_remotely: clone(boundary.cannot_conclude_remotely || []),
  };
}

export function selfReportedBackground(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return {
    value: value.trim().slice(0, 1200),
    classification: "self_reported_consultation_background",
    verification_status: "unverified_requires_in_person_assessment",
    technical_effect: "does_not_enable_any_technical_feasibility_claim",
  };
}

export function caseReplicabilityWarning(workId) {
  return `${workId} 只证明 SunSun 曾如何处理该历史案例中的问题与冲突；不证明访客可以复制相同技术或结果。`;
}

export function isSupportedCaseId(value) {
  return /^public-case-[0-9]{3}$/.test(value || "");
}

export function toWebMCPResult(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

export function cleanString(value, maxLength = 1200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function cleanStringArray(value, maxItems = 20) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => cleanString(item))
    .filter(Boolean)
    .slice(0, maxItems);
}
