# The Mirror — Final Demo Reliability Check

Date: 2026-08-30  
Environment: production HTTPS deployment  
Scenario: designed visibility / professional and private identity / low maintenance  
Journey per run: discovery → `explore_stylist_fit` → `get_work_details(public-case-003)` → `build_consultation_brief`

## Result

**5/5 complete production runs passed.** No tool runtime error, console error, missing field, or output drift occurred during the five counted runs.

| Run | Discovery | Explore | Details | Brief | Total | Result |
|---:|---:|---:|---:|---:|---:|---|
| 1 | 26 ms | 6160 ms | 2237 ms | 2862 ms | 11285 ms | PASS |
| 2 | 27 ms | 3504 ms | 2539 ms | 3073 ms | 9143 ms | PASS |
| 3 | 27 ms | 3067 ms | 2666 ms | 2345 ms | 8105 ms | PASS |
| 4 | 23 ms | 3102 ms | 2456 ms | 3458 ms | 9039 ms | PASS |
| 5 | 25 ms | 2857 ms | 2190 ms | 2448 ms | 7520 ms | PASS |

Average complete journey: **9018 ms**. Range: **7520–11285 ms**.

## Stable output checks

Every counted run produced:

- exactly four discovered tools: `search_works`, `get_work_details`, `explore_stylist_fit`, `build_consultation_brief`;
- `strong_fit_evidence` from `explore_stylist_fit`;
- `public-case-003` and `public-case-004` as the first two relevant cases;
- `public-case-002` as a consistent third relevant case;
- `public-case-003` details with the underlying need `按社会情境控制个性可见度`;
- the judgment `可见性可以被连续设计，不是开关`;
- `pre_consultation_intent_brief`;
- `requires_in_person_assessment`, including `technical_plan`;
- `No technical result is promised before in-person assessment.`;
- no browser console errors or warnings.

## Preflight observation

Before the five counted runs, an immediate call was attempted while the page registration message and the browser's tool snapshot were briefly out of sync. The browser requested a fresh tool snapshot. The same condition appeared once immediately after a reload without a settling pause.

This was not a tool execution failure and was not reproducible after the recording sequence was adjusted to:

1. wait for `WebMCP interface available`;
2. hold for approximately 0.7 seconds;
3. fetch the tool list;
4. refresh the list once only if the browser reports a stale snapshot.

No product code change was made. This is treated as recording orchestration behavior, not a repeatable runtime bug.

## Agent behavior

No case of an agent declining to call WebMCP was observed. The reliability harness explicitly invoked the three frozen Demo calls, so it tests live discovery and tool execution—not the discretionary tool-choice behavior of every possible agent host.

## Recording verdict

The production journey is stable enough to record. Use the settling pause and keep one public-only fallback still ready for each key moment.
