import { knowledgeDataLoader } from "./data-loader.js";
import { executeSearchWorks } from "./search-works.js";
import { executeGetWorkDetails } from "./get-work-details.js";
import { executeExploreStylistFit } from "./explore-stylist-fit.js";
import { executeBuildConsultationBrief } from "./build-consultation-brief.js";

const TOOL_IMPLEMENTATIONS = Object.freeze([
  {
    name: "search_works",
    title: "搜索 SunSun 真实案例",
    execute: executeSearchWorks,
    untrustedContentHint: false,
  },
  {
    name: "get_work_details",
    title: "了解一件作品的设计判断",
    execute: executeGetWorkDetails,
    untrustedContentHint: false,
  },
  {
    name: "explore_stylist_fit",
    title: "探索与 SunSun 的专业契合度",
    execute: executeExploreStylistFit,
    untrustedContentHint: false,
  },
  {
    name: "build_consultation_brief",
    title: "整理到店前咨询意图简报",
    execute: executeBuildConsultationBrief,
    untrustedContentHint: true,
  },
]);

export async function registerSunSunWebMCPTools({
  modelContext = globalThis.document?.modelContext,
  loader = knowledgeDataLoader,
} = {}) {
  if (!modelContext || typeof modelContext.registerTool !== "function") {
    return { supported: false, registered: [], errors: [] };
  }

  const controller = new AbortController();
  const registered = [];
  const errors = [];

  for (const implementation of TOOL_IMPLEMENTATIONS) {
    try {
      const contract = await loader.loadToolContract(implementation.name);
      await modelContext.registerTool(
        {
          name: implementation.name,
          title: implementation.title,
          description: contract.purpose,
          inputSchema: contract.input_schema,
          annotations: {
            readOnlyHint: true,
            untrustedContentHint: implementation.untrustedContentHint,
          },
          execute: (input) => implementation.execute(input, loader),
        },
        { signal: controller.signal },
      );
      registered.push(implementation.name);
    } catch (error) {
      errors.push({
        name: implementation.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (errors.length > 0) {
    controller.abort();
    return {
      supported: true,
      registered: [],
      errors,
      unregister: () => {},
    };
  }

  return {
    supported: true,
    registered,
    errors,
    unregister: () => controller.abort(),
  };
}

if (typeof document !== "undefined") {
  registerSunSunWebMCPTools().then((result) => {
    if (result.supported && result.errors.length > 0) {
      console.warn("SunSun WebMCP registration completed with errors:", result.errors);
    }
  }).catch((error) => {
    console.warn("SunSun WebMCP registration skipped:", error);
  });
}
