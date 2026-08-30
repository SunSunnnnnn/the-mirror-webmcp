import { knowledgeDataLoader } from "./data-loader.js";
import {
  boundaryOutput,
  caseReplicabilityWarning,
  consultationSafeWork,
  toWebMCPResult,
} from "./safety.js";

const CONCERN_DIMENSIONS = Object.freeze({
  low_maintenance: ["temporal_aesthetics", "maintenance_expectation"],
  long_return_interval: ["temporal_aesthetics", "previous_work_as_material"],
  work_visibility_constraint: ["identity_expression", "designed_visibility"],
  private_public_identity_conflict: ["psychological_fit", "identity_expression"],
  fear_of_yellow_or_orange_fade: ["underlying_need", "temporal_aesthetics"],
  self_reported_old_bleach_history: ["hair_integrity", "previous_work_as_material"],
  self_reported_damaged_hair_constraint: ["hair_integrity", "productive_constraints"],
  grow_out_concern: ["temporal_aesthetics", "previous_work_as_material"],
  strong_expression: ["identity_expression", "visual_strategy"],
  hidden_expression: ["invisible_detail", "designed_visibility"],
  experimental_openness: ["open_aesthetic_space", "psychological_fit"],
  previous_work_as_material: ["previous_work_as_material", "temporal_aesthetics"],
  constraint_transformed_into_design: ["productive_constraints", "design_moves"],
});

const HIGH_PRIORITY_FIELDS = [
  "design_problem",
  "underlying_need",
  "productive_constraints",
  "judgment",
  "design_moves",
  "identity_expression",
  "temporal_aesthetics",
  "context",
];

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function selectedText(work) {
  return normalize(JSON.stringify(
    Object.fromEntries(HIGH_PRIORITY_FIELDS.map((key) => [key, work[key]])),
  ));
}

export function concernsFromFreeText(value, vocabulary) {
  const text = normalize(value);
  if (!text) return [];
  return Object.entries(vocabulary)
    .filter(([, terms]) => terms.some((term) => text.includes(normalize(term))))
    .map(([concern]) => concern);
}

function scoreWork(work, requestedConcerns, visualPreferences, vocabulary) {
  const text = selectedText(work);
  const matchedConcerns = requestedConcerns.filter((concern) =>
    (vocabulary[concern] || []).some((term) => text.includes(normalize(term))),
  );
  const visualText = normalize(JSON.stringify(work.visual_result || {}));
  const visualMatches = visualPreferences.filter((preference) =>
    visualText.includes(normalize(preference)),
  );

  return {
    score: matchedConcerns.length * 10 + visualMatches.length,
    matchedConcerns,
    visualMatches,
  };
}

function conciseSummary(work) {
  return work.design_problem?.summary_zh
    || work.visual_result?.summary_zh
    || "SunSun 已确认的历史设计判断案例。";
}

export async function searchWorksData(input = {}, loader = knowledgeDataLoader) {
  const [works, boundary, vocabulary] = await Promise.all([
    loader.loadWorks(),
    loader.loadSystemBoundary(),
    loader.loadConcernVocabulary(),
  ]);
  const explicitConcerns = Array.isArray(input.concerns) ? input.concerns : [];
  const invalidConcerns = explicitConcerns.filter((item) => !vocabulary[item]);
  if (invalidConcerns.length > 0) {
    throw new TypeError(`Unsupported concern: ${invalidConcerns.join(", ")}`);
  }

  const requestedConcerns = [...new Set([
    ...explicitConcerns,
    ...concernsFromFreeText(input.free_text_concern, vocabulary),
  ])];
  if (requestedConcerns.length === 0) {
    throw new TypeError("At least one supported concern or mappable free-text concern is required.");
  }

  const visualPreferences = Array.isArray(input.visual_preferences)
    ? input.visual_preferences.filter((item) => typeof item === "string").slice(0, 10)
    : [];
  const limit = Math.min(5, Math.max(1, Number.isInteger(input.limit) ? input.limit : 3));
  const matches = works
    .map((work) => ({ work, ...scoreWork(work, requestedConcerns, visualPreferences, vocabulary) }))
    .filter((item) => item.matchedConcerns.length > 0)
    .sort((a, b) => b.score - a.score || a.work.work_id.localeCompare(b.work.work_id))
    .slice(0, limit)
    .map(({ work, matchedConcerns }) => {
      const safe = consultationSafeWork(work);
      return {
        work_id: work.work_id,
        concise_case_summary: conciseSummary(work),
        matched_concerns: matchedConcerns,
        relevant_judgment_dimensions: [...new Set(
          matchedConcerns.flatMap((concern) => CONCERN_DIMENSIONS[concern] || []),
        )],
        why_this_case_is_relevant: `这个历史案例直接呈现了 ${matchedConcerns.join("、")} 所对应的 SunSun 判断方式。`,
        technical_replicability_warning: caseReplicabilityWarning(work.work_id),
        publication_safe_media: safe.publication_safe_media,
        public_url: safe.public_url,
      };
    });

  const remoteBoundary = boundaryOutput(boundary);
  return {
    matches,
    requires_in_person_assessment: remoteBoundary.requires_in_person_assessment,
    what_cannot_be_concluded_remotely: remoteBoundary.cannot_conclude_remotely,
  };
}

export async function executeSearchWorks(input, loader = knowledgeDataLoader) {
  return toWebMCPResult(await searchWorksData(input, loader));
}
