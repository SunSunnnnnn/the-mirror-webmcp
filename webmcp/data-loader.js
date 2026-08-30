import { getKnowledgeDatasetConfig } from "./knowledge-config.js";

async function defaultLoadJson(url) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Knowledge Layer request failed (${response.status}): ${url}`);
  }

  return response.json();
}

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

export class KnowledgeDataLoader {
  constructor({ datasetMode, baseUrl, loadJson = defaultLoadJson } = {}) {
    const config = getKnowledgeDatasetConfig(datasetMode);
    const selectedBaseUrl = baseUrl || config.baseUrl;
    this.datasetMode = baseUrl ? (datasetMode || "custom") : config.mode;
    this.datasetId = baseUrl ? null : config.datasetId;
    this.baseUrl = selectedBaseUrl instanceof URL
      ? selectedBaseUrl
      : new URL(selectedBaseUrl, globalThis.location?.href || import.meta.url);
    this.loadJson = loadJson;
    this.cache = new Map();
  }

  async read(relativePath) {
    const url = new URL(relativePath, this.baseUrl);
    const key = url.href;

    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        Promise.resolve(this.loadJson(url)).catch((error) => {
          this.cache.delete(key);
          throw error;
        }),
      );
    }

    return clone(await this.cache.get(key));
  }

  async loadWorks() {
    const index = await this.read("works/index.json");
    const works = await Promise.all(
      index.records.map(async (entry) => ({
        ...await this.read(`works/${entry.path.replace(/^\.\//, "")}`),
        work_id: entry.work_id,
        client_id: entry.client_id,
        intervention_number: entry.intervention_number,
        decision_sufficient: entry.decision_sufficient,
      })),
    );

    return works;
  }

  async getWork(workId) {
    const works = await this.loadWorks();
    return works.find((work) => work.work_id === workId) || null;
  }

  loadSystemBoundary() {
    return this.read("boundaries/remote-physical-uncertainty.json");
  }

  loadUncertaintyTaxonomy() {
    return this.read("boundaries/uncertainty-taxonomy.json");
  }

  async loadConcernVocabulary() {
    const vocabulary = await this.read("vocabulary/concerns.json");
    return vocabulary.concerns;
  }

  loadToolContract(toolName) {
    return this.read(`tools/${toolName}.contract.json`);
  }
}

export const knowledgeDataLoader = new KnowledgeDataLoader();
