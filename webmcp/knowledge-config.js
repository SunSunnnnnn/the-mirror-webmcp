const PUBLIC_SAMPLE_CONFIG = Object.freeze({
  mode: "public-sample",
  datasetId: "sunsun-design-judgment-public-sample-v1",
  baseUrl: new URL("../data/public-sample/", import.meta.url),
  publicSafe: true,
});

export function getKnowledgeDatasetConfig(requestedMode = "public-sample") {
  if (requestedMode !== "public-sample") {
    throw new TypeError(`Unsupported public dataset mode: ${requestedMode}`);
  }
  return PUBLIC_SAMPLE_CONFIG;
}

export const DEFAULT_DATASET_MODE = "public-sample";
export const knowledgeDatasetConfig = getKnowledgeDatasetConfig();
