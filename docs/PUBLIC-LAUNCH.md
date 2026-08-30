# The Mirror — Public Launch Kit

Public infrastructure is live. Social launch materials remain unpublished.

## Public assets

- Live URL: [https://the-mirror-webmcp.netlify.app/](https://the-mirror-webmcp.netlify.app/)
- GitHub repository: [https://github.com/SunSunnnnnn/the-mirror-webmcp](https://github.com/SunSunnnnnn/the-mirror-webmcp)
- YouTube demo: `[placeholder]`

## One-sentence pitch

The Mirror lets AI agents inspect how a professional makes judgments, not just what they sell.

## Short pitch

The Mirror is a WebMCP experiment that makes a hairstylist's professional judgment queryable by AI agents. Instead of remotely diagnosing hair or prescribing a colour, it exposes structured evidence of how SunSun has handled real constraints: protecting hair integrity, understanding the need behind a literal request, designing visibility around work and identity, and considering how a result evolves over time. Four read-only tools help an agent search judgment evidence, inspect one historical reasoning chain, explore stylist fit, and prepare a non-technical consultation brief. The public repository includes only an anonymized demonstration sample; the complete proprietary knowledge layer is not included.

## Long description

AI is already good at finding what a professional sells. It can search a portfolio, compare reviews, list prices, and summarize services. What it usually cannot inspect is how that professional makes decisions when a real person arrives with conflicting needs, uncertain physical conditions, lifestyle constraints, and a request that may not describe the underlying problem.

The Mirror explores a different interface for professional discovery. It turns selected evidence of SunSun Wong's hair-colour design judgment into a structured public sample that an AI agent can query through WebMCP. The agent can search for cases involving low maintenance, designed visibility, identity boundaries, previous work, or productive constraints. It can inspect the reasoning behind one anonymized case, assess whether SunSun's way of thinking appears relevant to a visitor, and turn the conversation into a pre-consultation intent brief.

The safety boundary is central to the product. A visitor at home cannot reliably verify strand integrity, chemical history, pigment buildup, or achievable lift. The Mirror therefore does not diagnose hair, promise technical feasibility, prescribe exact bleaching levels, or claim that an earlier result can be reproduced. Historical cases are evidence of professional judgment—not remote diagnostic templates.

The repository contains four read-only WebMCP tools, four anonymized public sample cases, eight public judgment rules, and explicit uncertainty boundaries. It does not contain the complete proprietary SunSun Design Knowledge Layer or client media.

Built in Guangzhou as an independent experiment inspired by the WebMCP Challenge prompt, The Mirror asks a broader question: could judgment compatibility become a useful signal when agents help people discover high-judgment professionals?

## Demo story

Visitor prompt:

> “I need to wear my hair up at work and can't look too dramatic, but outside work I don't want to feel boring. I also don't want frequent maintenance.”

The live journey:

1. `explore_stylist_fit` maps the visitor's concern to designed visibility, identity boundaries, and low-maintenance evidence.
2. The agent opens `public-case-003`, where public and private self-expression were designed into different visibility states.
3. It also recognizes `public-case-004`, where a later visit changed the accepted visibility boundary instead of treating the person as a blank case.
4. `build_consultation_brief` records the visitor's intention, constraints, and unresolved questions without creating a technical plan.

Expected conclusion:

> “SunSun has previously designed around the same tension between professional visibility and private self-expression. Your actual hair condition and technical plan still require an in-person assessment.”

## Suggested launch post

### GitHub / community / LinkedIn

Introducing The Mirror: a WebMCP experiment in making professional judgment machine-readable. AI can already find portfolios, reviews, prices, and services—but it rarely sees how a professional makes decisions. The Mirror gives agents four read-only tools for inspecting anonymized evidence of how hairstylist SunSun Wong reasons about constraints, underlying needs, identity, visibility, maintenance, and long-term evolution. It deliberately does not diagnose hair or prescribe a technical result remotely. Built in Guangzhou as an independent experiment inspired by the WebMCP Challenge prompt. Demo: https://the-mirror-webmcp.netlify.app/ Source: https://github.com/SunSunnnnnn/the-mirror-webmcp

### X / short social copy

The Mirror is a WebMCP experiment that lets AI inspect how a professional makes judgments—not just what they sell. Four read-only tools, an anonymized public sample, and a hard boundary against remote diagnosis. Built in Guangzhou. https://the-mirror-webmcp.netlify.app/
