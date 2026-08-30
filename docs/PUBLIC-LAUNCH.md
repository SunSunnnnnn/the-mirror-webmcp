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

## Final launch copy

### 1. WebMCP / developer community

The Mirror is a WebMCP experiment in making professional judgment machine-readable. Most professional-service websites expose outcomes, services, prices, and reviews. They rarely expose the reasoning that produced an outcome.

This project gives an agent four read-only tools for inspecting anonymized evidence of how hairstylist SunSun Wong has reasoned about real constraints: the need behind a literal request, work and identity boundaries, maintenance, hair integrity, and long-term evolution. The agent can explore stylist fit, inspect one judgment chain, and prepare a pre-consultation intent brief. It cannot diagnose hair remotely, promise feasibility, or derive a technical formula from a historical case.

Live: https://the-mirror-webmcp.netlify.app/

Source: https://github.com/SunSunnnnnn/the-mirror-webmcp

### 2. General professional / creative audience

When AI helps someone find a professional, it can see portfolios, reviews, prices, and services. But those signals do not explain how the person makes decisions when the real situation is uncertain, constrained, or emotionally complicated.

The Mirror is a small experiment built from the work of hairstylist SunSun Wong. Instead of recommending a hairstyle, it lets an AI inspect evidence of how she has understood underlying needs, protected future options, designed around work and identity, and turned limitations into part of the design. The goal is not to replace consultation. It is to help someone understand why a particular professional may be worth consulting.

Live: https://the-mirror-webmcp.netlify.app/

### 3. 中文社交帖

我是一个染发师，但最近我一直在想一个和发色无关的问题：当 AI 帮人寻找专业人士时，它凭什么判断这个人值不值得信任？

作品照片能展示结果，评价能描述满意度，价格表能说明服务，却很难告诉 AI：面对受损、预算、工作环境、身份表达和模糊需求时，这个专业人士保护了什么、拒绝了什么，又为什么选择另一条设计路径。

所以我做了 The Mirror。它不是 AI 发型推荐，也不是线上诊断工具。它把一小部分匿名真实案例整理成可查询的“判断证据”，让 AI 看见我如何理解客户没有直接说出的需求，如何把可见度、维护周期和长期变化纳入设计，以及为什么历史案例不能直接变成另一个人的技术模板。

我想测试的是一种新的专业发现方式：未来 AI 帮我们找设计师、顾问或其他高判断力专业人士时，除了看他们卖什么，能不能也理解他们如何思考。

在线体验：https://the-mirror-webmcp.netlify.app/

项目源码：https://github.com/SunSunnnnnn/the-mirror-webmcp
