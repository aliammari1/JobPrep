# Open Source Growth Plan

This plan turns the repository review into a practical backlog for JobPrep.

## Quick wins

- Add screenshots and a short demo video for mock interviews, CV builder, coding challenges, and analytics.
- Add Playwright or Cypress coverage for the interview flow, CV flow, and code challenge flow.
- Add unit tests for AI provider fallback behavior.
- Add clear documentation for model-provider environment variables.
- Add prompt-injection and rate-limit handling guidance for AI endpoints.
- Add `good first issue` tasks for docs, accessibility, test coverage, and UI states.

## Bugs and bad practices to watch

- API keys or model-provider secrets exposed to browser bundles.
- Unvalidated AI responses flowing directly into UI or persistence layers.
- Missing fallback behavior when a model provider is unavailable.
- Prompt-injection risks in CV, interview, and cover-letter flows.
- Analytics calculations tightly coupled to UI components.

## Star growth strategy

1. Add a live demo with synthetic profiles and interview scenarios.
2. Put value-oriented screenshots above the fold in the README.
3. Add GitHub topics such as `nextjs`, `ai`, `interview-prep`, `career`, and `typescript`.
4. Publish a technical guide about multi-provider LLM integration.
5. Add public roadmap items for voice, analytics, and coding interview improvements.

## Trending-library opportunities

- Use Pydantic-AI-style schemas for validated AI outputs.
- Use LangExtract-style extraction for structured interview transcript insights.
- Use Data-Formulator-style dashboards for candidate progress analytics.
- Use GPT-Pilot-style code explanation features for challenges.

## Suggested next PRs

- Add provider abstraction tests and fallback fixtures.
- Add Playwright smoke tests for the main user journey.
- Add AI security and prompt-injection checklist.
