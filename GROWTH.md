# GROWTH.md — JobPrep distribution & launch kit

Ready-to-paste assets for getting JobPrep in front of people who need it. The
single highest-leverage frame: **"open-source, BYOK, self-host alternative to
Final Round AI / Interview Coder / Pramp — $0 vs ~$149/mo."** Lead with that
everywhere. (Operational launch checklist also lives in
[`docs/TRENDING.md`](docs/TRENDING.md); this file is the copy/paste kit.)

---

## 1. GitHub repo metadata (Settings)

**Topics** (exact-match search terms — set 12 of the 20 allowed):

```
ai, interview-prep, nextjs, llm, byok, self-hosted,
open-source-alternative, livekit, ai-agents, ollama, claude, resume
```

**About box** (≤ 350 chars, keyword-dense, with the magnet phrase):

> Open-source AI interview-prep platform — multi-LLM mock interviews with **BYOK,
> self-host, no subscription**. A free alternative to Final Round AI, Interview
> Coder & Pramp. Live video mock interviews (LiveKit), ATS CV builder, coding
> arena. Run Claude/GPT/Gemini — or fully local with Ollama. Next.js 15 + Bun.

**Website:** the live CF Pages demo URL (e.g. `https://jobprep.pages.dev`).

**Consider flagging the repo as a GitHub _Template repository_** (Settings →
General → Template repository). Interview-prep is a clonable starter; people star
templates to bookmark-for-reuse, and the "Use this template" button is a passive
star faucet. The Deploy-to-Cloudflare button in the README pairs with this.

---

## 2. About text (one-liner + short + long)

**One-liner (bio / X / link previews):**
> Open-source AI interview prep — multi-LLM, BYOK, self-host. Free alternative to Final Round AI.

**Short (directory submissions, ~50 words):**
> JobPrep is an open-source, self-hostable AI interview-prep platform. Run live
> video mock interviews with AI feedback, build an ATS-friendly CV, and grind a
> coding arena — powered by Claude, GPT, Gemini, or a fully local Ollama model.
> Bring your own API key; your practice data stays in your own database.

**Long (Product Hunt / blog intro):**
> Most interview-prep tools lock you into one AI vendor, charge $96–$149/month,
> and keep your practice sessions on their servers. JobPrep is the open-source
> answer: a multi-LLM mock-interview platform you self-host or run with your own
> API key. Switch between Claude, GPT, Gemini, or a local Ollama model per
> request; practice live video interviews over LiveKit with AI feedback on your
> answers, tone, and body language; build an ATS CV (with one-click LinkedIn
> import via a Chrome extension); and drill coding challenges in 15+ languages.
> $0, your keys, your data.

---

## 3. Show HN

**Title** (story-shaped, names the paid incumbent, leads with the $0 angle):
> Show HN: JobPrep – open-source, BYOK alternative to Final Round AI ($0, self-host, runs on local Ollama)

**First comment (seed it yourself, reply fast):**
> I kept hitting interview-prep tools that wanted $149/month, locked me to one AI
> model, and stored every practice answer on their servers. So I built JobPrep —
> an open-source platform you self-host or run with your own API key.
>
> What it does: live video mock interviews over LiveKit with AI feedback on your
> answers + tone + body language; an ATS CV builder with LinkedIn import (Chrome
> extension); and a coding arena across 15+ languages.
>
> The part I'm proudest of: the AI Coach is provider-agnostic. You pass a
> `<provider>:<model>` id per request, so you can run Claude, GPT, Gemini — or a
> **fully local Ollama model with no API key and no data leaving your machine**.
>
> Stack: Next.js 15 / React 19 / Bun / Prisma+Postgres, plus a Python LiveKit
> avatar agent. Honest caveat: the avatar agent is a long-running WebRTC process,
> so it can't run on Cloudflare Workers — the web app deploys to Cloudflare and
> the agent runs on a container next to LiveKit Cloud. License is
> source-available (free for personal/education/research).
>
> Repo + live demo in the README. Brutal feedback welcome — especially on the AI
> feedback quality and the self-host story.

_Timing:_ Tue–Thu, ~13:00–16:00 UTC. Reply to every comment within the hour.

---

## 4. Reddit

### r/leetcode

**Title:** I built a free, open-source interview-prep tool you can self-host (multi-LLM coding arena + mock interviews) — no $149/mo subscription

**Body:**
> Got tired of paying for interview-prep SaaS that locks you to one AI model, so
> I open-sourced mine. JobPrep has a coding arena (15+ languages, instant eval),
> live AI mock interviews, and an ATS CV builder. The AI coach runs on Claude,
> GPT, Gemini — or a **local Ollama model for free/offline**, so you bring your
> own key (or none).
>
> It's free and self-hostable; your submissions stay in your own DB. Repo + a
> live BYOK demo are in the README. Would love feedback from people actually
> grinding right now — what's missing from the practice loop? [link]

### r/cscareerquestions

**Title:** Made an open-source alternative to the $100–150/mo interview-prep tools (Final Round AI / Pramp style) — free, BYOK, self-host

**Body:**
> A lot of the interview-prep tools people recommend here run $96–$149/month and
> keep your data. I built a free, open-source one: live video mock interviews
> with AI feedback (answers, tone, body language), an ATS CV builder with
> LinkedIn import, and a coding arena.
>
> The differentiator: you bring your own AI key (Claude/GPT/Gemini) or run it
> 100% locally with Ollama — nothing leaves your machine, and there's no
> subscription. Source-available, self-hostable. Sharing in case it saves
> someone the monthly fee. Repo + demo in the README; happy to answer setup
> questions. [link]

_(Build comment karma and read each sub's self-promo rules first; frame as
"I built X because Y frustrated me," not an ad.)_

---

## 5. Awesome-list / directory submissions

**awesome-selfhosted** (under _Self-hosting_ / _Productivity_ → propose a
"Career / Interview Prep" entry; must pass `awesome-lint`):
```
- [JobPrep](https://github.com/aliammari1/JobPrep) - Self-hostable AI interview-prep platform: multi-LLM mock interviews (BYOK or local Ollama), ATS CV builder, and a coding arena. ([Demo](https://jobprep.pages.dev)) `Source-available` `Nodejs/Bun`
```

**awesome-ai-tools / awesome-artificial-intelligence** (Career / Productivity):
```
- [JobPrep](https://github.com/aliammari1/JobPrep) - Open-source, BYOK AI interview-prep platform — multi-LLM mock interviews, ATS CV builder, coding arena. Self-host or run fully local with Ollama.
```

**awesome-nextjs** (Apps / Open Source):
```
- [JobPrep](https://github.com/aliammari1/JobPrep) - Open-source AI interview-prep platform (Next.js 15 + Bun): multi-LLM mock interviews, LiveKit video, ATS CV builder. BYOK / self-host.
```

**open-source-alternative directories** — submit to **OpenAlternative**,
**opensource.builders**, **LibHunt**, and **SaaSHub** as the open-source
alternative to **Final Round AI**, **Interview Coder**, and **Pramp**.

---

## 6. Quick links

- Banner / social-preview brief: [`BANNER.md`](BANNER.md)
- Launch checklist & PH/HN ops notes: [`docs/TRENDING.md`](docs/TRENDING.md)
- Chrome Web Store publishing: [`docs/CHROME_WEB_STORE.md`](docs/CHROME_WEB_STORE.md)
- Architecture / deployment: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
