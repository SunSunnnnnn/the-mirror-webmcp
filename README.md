# The Mirror

### A WebMCP experiment in making professional judgment machine-readable.

The goal is not to help a visitor find a hairstyle. The goal is to help a visitor understand whether they have found a hairstylist they can trust with the problem.

WebMCP does not replace consultation. It makes consultation worth happening.

## Live Demo

Explore the public experiment at [the-mirror-webmcp.netlify.app](https://the-mirror-webmcp.netlify.app/).

Source and the anonymized public sample are available in the [public GitHub repository](https://github.com/SunSunnnnnn/the-mirror-webmcp).

## Origin

The Mirror was originally built in response to the [WebMCP Challenge](https://webmcp.devpost.com/rules) prompt. Because its creator is based in Guangzhou, China, it is not eligible for official submission under the Challenge's residency rules. It is therefore published independently as an open WebMCP experiment.

## Demo Video

Watch the final public demo: [The Mirror — Making Professional Judgment Machine-Readable with WebMCP](https://youtu.be/mg1tr0RqEpQ).

## The problem

AI can already find portfolios, reviews, prices, and services. It usually cannot inspect **how a professional makes decisions**.

Hair colour is a useful test case. Someone searching from home may know the experience they want, but they usually cannot verify their actual hair condition. An agent cannot safely diagnose it remotely either.

The Mirror therefore does not attempt remote diagnosis. It lets an agent inspect structured evidence of how SunSun has previously:

- reasoned under real constraints;
- refused or changed an unsafe original direction;
- distinguished a literal colour request from the need behind it;
- considered maintenance, identity, work context, visibility, and long-term evolution.

## What The Mirror does

The project exposes four read-only WebMCP tools:

### `search_works`

Search real judgment evidence by concerns such as maintenance, identity, visibility, prior work, or productive constraints.

### `get_work_details`

Understand the reasoning behind one anonymized historical case: context, design problem, judgment, design moves, uncertainty, and evolution.

### `explore_stylist_fit`

Evaluate whether SunSun's way of thinking appears relevant to the visitor's needs without prescribing a hairstyle.

### `build_consultation_brief`

Turn the conversation into a non-persistent pre-consultation intent brief while leaving physical and technical decisions for an in-person assessment.

## What it does not do

- diagnose real hair condition remotely;
- promise technical feasibility;
- prescribe exact bleaching levels or formulas;
- claim that a historical result can be reproduced;
- replace an in-person consultation.

## Example

> “I need to wear my hair up at work and can't look too dramatic, but outside work I don't want to feel boring. I also don't want frequent maintenance.”

The Mirror can surface evidence about designed visibility, identity boundaries, and low-maintenance thinking. The conclusion is not “you should get pink hidden colour.” It is:

> “SunSun has previously designed around the same tension between professional visibility and private self-expression. Your actual hair condition and technical plan still require an in-person assessment.”

## Architecture

```text
Human
  ↓
AI Agent
  ↓
WebMCP
  ↓
Public Judgment Sample
  ↓
Professional Judgment Evidence
```

The repository includes an anonymized demonstration subset derived from real SunSun design cases. The complete proprietary SunSun Design Knowledge Layer is not included in this repository.

## Run locally

No framework, package installation, account, or API key is required.

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. In a browser without `document.modelContext`, the page remains a normal static explanation. In a compatible environment, `webmcp/register-tools.js` registers the four tools.

## Tests

Node.js 20 or newer is required for the test suite.

```bash
npm test
npm run test:build
npm run audit
```

Or run the complete release check:

```bash
npm run verify
```

Build the static release into `dist/` with:

```bash
npm run build
```

## Repository map

- `webmcp/` — runtime, tool registration, safety boundary, demo fixture, and tests;
- `data/public-sample/` — four anonymized cases, eight public rules, contracts, vocabulary, and uncertainty boundaries;
- `docs/` — launch preparation and a two-to-three-minute demo script;
- `PUBLIC-RELEASE-AUDIT.md` — release-candidate audit result.

## Licensing

Software code is licensed under the Mozilla Public License 2.0. See `LICENSE`.

The anonymized public sample dataset is licensed under CC BY 4.0 with the attribution “SunSun Design Judgment Dataset — Public Sample, by SunSun Wong.” See `DATA-LICENSE.md`.
