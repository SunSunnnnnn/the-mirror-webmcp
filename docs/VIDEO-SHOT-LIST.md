# The Mirror — Final Video Shot List

Target runtime: **2:46**. Hard stop: **2:50**. Record the live site and real WebMCP calls; use the prepared public-only fallback stills only if recording fails.

## Recording setup

- Close unrelated tabs and notifications before recording.
- Use the live URL: `https://the-mirror-webmcp.netlify.app/`.
- Confirm the page says `WebMCP interface available`.
- After discovery appears, wait **0.7 seconds** before Call 1. This avoids a transient browser-snapshot race observed during preflight.
- Keep output collapsed or cropped to the named fields. Do not scroll through full JSON.
- Use the exact scenario in Shot 3. Do not add physical hair-condition claims.

## Shot list

| Time | Browser picture | Mouse / input action | Tool call | Fields to highlight | Voiceover purpose | Duration |
|---|---|---|---|---|---|---:|
| 0:00–0:18 | Clean hero view: The Mirror title and thesis | Slow pointer settle; no clicking | — | “Professional judgment · WebMCP”; “How does the stylist think?” | Establish that portfolios, reviews, prices, and services do not reveal judgment | 18s |
| 0:18–0:35 | Scroll just enough to show the result-versus-reasoning problem and four tool cards | One controlled scroll; pause over tool cards | Discovery only | Exactly four read-only tools | Introduce The Mirror as professional discovery and explain WebMCP in one sentence | 17s |
| 0:35–0:45 | Agent input area with the full scenario visible | Paste the exact scenario; pause before submit | — | Work restraint, private expression, low maintenance | Let viewers understand the human problem before any tool result | 10s |
| 0:45–1:10 | Call 1 result, cropped to the strongest evidence | Run after the 0.7s post-discovery pause; reveal only the summary and first two cases | `explore_stylist_fit` | `strong_fit_evidence`; `designed_visibility`; identity boundary; low maintenance; `public-case-003`; `public-case-004` | Show that the agent is finding judgment evidence, not choosing a hairstyle | 25s |
| 1:10–1:50 | Case detail view with three-part judgment chain | Open `public-case-003`; move pointer from context → underlying need → judgment → design move | `get_work_details` | Work requires tied hair; professional/private tension; visibility as a variable; restrained outer layer / expressive inner layer; movement and distance | Deliver the core proof: an image shows colour, while the tool exposes why it was placed there | 40s |
| 1:50–2:20 | Compact “Pre-consultation Intent Brief” view | Run with only previously expressed information; reveal the brief top to bottom | `build_consultation_brief` | Identity tension; low-maintenance preference; desired visibility; relevant cases; unresolved questions | Show that the output improves the next conversation without prescribing a result | 30s |
| 2:20–2:38 | Boundary block, visually quiet | Highlight the assessment list and final notice once; do not run hostile prompts | — | `requires_in_person_assessment`; “No technical result is promised before in-person assessment.” | Explain why historical conditions are judgment evidence, not remote diagnosis | 18s |
| 2:38–2:50 | Final The Mirror title card | No interaction; hold long enough to read links | — | Thesis, Live Demo URL, GitHub URL | End on the frozen thesis | 12s |

## Exact scenario

> I need to wear my hair up at work and can't look too dramatic, but outside work I don't want to feel boring. I also don't want frequent maintenance. Can you help me decide whether this stylist might understand what I'm looking for?

## Recording cautions

- `public-case-002` may appear as a third, lower-ranked relevant case. Keep the crop on `public-case-003` and `public-case-004`; do not imply that only two cases exist.
- If tool discovery is visible but a call has not yet become available, wait and refresh the tool list once. Do not change the product during recording.
- Do not show hostile-prompt tests, private tabs, browser profiles, local paths, or customer media.
- Do not improvise a colour recommendation in narration.
