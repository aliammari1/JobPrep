# Launch & discovery checklist

Maintainer notes for getting JobPrep in front of the right people. The honest
hook is **multi-AI + self-host/Ollama**: most interview-prep tools lock you to
one vendor; JobPrep runs Claude, GPT, Gemini, **or a fully local Ollama model**.

## GitHub repo settings

- **Social preview**: set `assets/banner.png` (Settings → Social preview) — see
  [`BANNER.md`](../BANNER.md).
- **About box**: short description + website + the topics below.
- **Topics** (Settings → Topics):
  `ai`, `interview-preparation`, `career`, `nextjs`, `typescript`,
  `livekit`, `webrtc`, `ai-agents`, `ollama`, `self-hosted`, `claude`, `openai`,
  `gemini`, `cv-builder`, `resume`, `chrome-extension`, `cloudflare`, `prisma`,
  `bun`.

## Chrome Web Store

Publish the extension — see [`CHROME_WEB_STORE.md`](CHROME_WEB_STORE.md). A live
store listing is itself a discovery channel and a credibility signal.

## Product Hunt

- Category: **AI / Developer Tools / Career**.
- Tagline: *"Multi-AI interview prep — practice with a live AI avatar, build an
  ATS CV, and run it all on your own Ollama model."*
- Assets: the triptych banner + 3 GIFs (CV builder, live mock interview, code
  arena). Have the two-part deploy story ready (CF for web, container for the
  agent) — technical hunters reward honest architecture.

## Show HN / Hacker News

- Title angle: *"Show HN: JobPrep – open-ish interview prep you can run fully
  local with Ollama (Next.js + a Python LiveKit avatar agent)."*
- Lead with the **self-host / privacy** angle and the **provider-agnostic AI
  Coach** (`<provider>:<model>` switch). Link the architecture + deployment docs
  and be upfront about the source-available license and the Workers-can't-run-
  Python limitation.

## Awesome lists

- **awesome-ai-tools** — submit under interview/career or AI assistants. Note the
  multi-provider + Ollama support.
- **awesome-selfhosted** — only borderline: it favors OSI-licensed projects, and
  JobPrep is **source-available**, so submit to the self-host-friendly subsections
  / "non-free" notes rather than the core list, and disclose the license.
- Niche: any "awesome-interview" / "awesome-career" lists.

## Reddit / communities

- r/cscareerquestions, r/leetcode (code arena), r/LocalLLaMA (the Ollama/self-host
  angle plays very well here), r/nextjs (the CF + opennext + LiveKit stack).

## Talking points (engineering judgment)

- Provider-agnostic AI via a model registry (`src/lib/ai/providers.ts`).
- Right-primitive-per-workload: edge for the app, container for the WebRTC agent.
- Honest CF Workers limits + LiveKit Cloud free tier for realtime.
- Bun + Biome single toolchain; release-please; CodeQL/gitleaks/Trivy/Scorecard.
