import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility smoke tests (axe-core). Scans the public, no-auth pages for
 * WCAG 2.1 A/AA violations. Kept to the marketing/auth surface so it stays
 * green without a backend; expand coverage as the app stabilizes.
 */
const PUBLIC_PAGES = ["/", "/sign-in"];

for (const path of PUBLIC_PAGES) {
  test(`a11y: ${path} has no critical/serious violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    // Surface the rule ids in the failure message for quick triage.
    expect(
      blocking,
      blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join("\n"),
    ).toEqual([]);
  });
}
