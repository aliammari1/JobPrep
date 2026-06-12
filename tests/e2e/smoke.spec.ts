import { expect, test } from "@playwright/test";

/**
 * High-value smoke flows that don't require a real backend (DB/Stripe/AI):
 *  - the landing page renders,
 *  - the auth (sign-in) flow is reachable and shows its form,
 *  - the CV builder route loads.
 * These pin that the app boots and the core navigation surface is intact.
 */

test("landing page renders", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/JobPrep/i);
});

test("sign-in page shows the auth form", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByText("Welcome Back")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("CV builder route loads", async ({ page }) => {
  const response = await page.goto("/cv-builder");
  // The page may redirect to auth when unauthenticated; either way it must not
  // 500. Accept any non-server-error response.
  expect(response?.status()).toBeLessThan(500);
});
