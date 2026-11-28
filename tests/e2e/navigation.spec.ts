import { devices, expect, test } from "@playwright/test";

for (const [device, platform, mode, controlHeight, controlRadius] of [
  ["iPhone 13", "ios", "ios", "44px", "12px"],
  ["Pixel 7", "android", "md", "48px", "8px"],
] as const) {
  test.describe(device, () => {
    const { defaultBrowserType: _, ...deviceOptions } = devices[device];
    test.use(deviceOptions);

    test("mobile navigation uses the platform toolbar and opens a sheet", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute(
        "data-jobprep-platform",
        platform,
      );
      await expect(page.locator(`ion-toolbar.${mode}`)).toBeVisible();
      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("dialog", { name: "Menu" });
      await expect(menu).toBeVisible();
      await page
        .getByRole("navigation", { name: "Mobile site navigation" })
        .getByRole("link", { name: "Features" })
        .click();
      await expect(page).toHaveURL(/\/features$/);
      await expect(menu).toBeHidden();
    });

    test("contact form uses platform-specific control sizes", async ({
      page,
    }) => {
      await page.goto("/contact");
      const topic = page.getByRole("combobox", { name: /topic/i });
      await expect(topic).toHaveCSS("min-height", controlHeight);
      await expect(topic).toHaveCSS("border-radius", controlRadius);
    });

    test("direct sign-in uses platform styling without loading mobile navigation", async ({
      page,
    }) => {
      await page.goto("/sign-in");
      await expect(page.locator("html")).toHaveAttribute(
        "data-jobprep-platform",
        platform,
      );
      await expect(page.locator("ion-toolbar")).toHaveCount(0);
      const email = page.getByLabel("Email or username");
      await expect(email).toHaveCSS("min-height", controlHeight);
      await expect(email).toHaveCSS("border-radius", controlRadius);
      await expect(page.getByLabel("Password", { exact: true })).toHaveCSS(
        "min-height",
        controlHeight,
      );
    });
  });
}

test.describe("iPad with desktop Safari identification", () => {
  const { defaultBrowserType: _, ...deviceOptions } = devices["iPad Pro 11"];
  test.use({
    ...deviceOptions,
    userAgent: devices["Desktop Safari"].userAgent,
  });

  test("recognizes iPadOS on a tablet-width viewport", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
      Object.defineProperty(navigator, "maxTouchPoints", { get: () => 5 });
    });
    await page.goto("/contact");
    await expect(page.locator("html")).toHaveAttribute(
      "data-jobprep-platform",
      "ios",
    );
    await expect(page.getByRole("combobox", { name: /topic/i })).toHaveCSS(
      "border-radius",
      "12px",
    );
  });
});

test("a narrow desktop window keeps the standard shadcn controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  await expect(page.locator("ion-toolbar.hydrated")).toBeVisible();
  await expect(page.locator("html[data-jobprep-platform]")).toHaveCount(0);
  const topic = page.getByRole("combobox", { name: /topic/i });
  await expect(topic).toHaveCSS("border-radius", "8px");
  await expect(topic).toHaveCSS("height", "36px");
});

test("feature tabs follow keyboard focus", async ({ page }) => {
  await page.goto("/features");
  const practice = page.getByRole("tab", { name: "AI Practice" });
  const formats = page.getByRole("tab", { name: "Interview Formats" });

  await expect(practice).toHaveAttribute("aria-selected", "true");
  await practice.focus();
  await page.keyboard.press("ArrowRight");
  await expect(formats).toBeFocused();
  await expect(formats).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toBeVisible();
});

test("pricing FAQ keeps one answer open and can collapse it", async ({
  page,
}) => {
  await page.goto("/pricing");
  const billing = page.getByRole("button", {
    name: "Can I switch or cancel plans anytime?",
  });
  const ai = page.getByRole("button", {
    name: "Can I use my own AI API key or run locally?",
  });

  await billing.press("Enter");
  await expect(billing).toHaveAttribute("aria-expanded", "true");
  await ai.press("Space");
  await expect(billing).toHaveAttribute("aria-expanded", "false");
  await expect(ai).toHaveAttribute("aria-expanded", "true");
  await ai.press("Enter");
  await expect(ai).toHaveAttribute("aria-expanded", "false");
});

test("contact topics can be selected and dismissed with the keyboard", async ({
  page,
}) => {
  await page.goto("/contact");
  const topic = page.getByRole("combobox", { name: /topic/i });

  await topic.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(
    page.getByRole("option", { name: "General Inquiry" }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("option", { name: "Team & Partnerships" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(topic).toContainText("Team & Partnerships");
  await topic.press("Enter");
  await page.keyboard.press("Escape");
  await expect(topic).toBeFocused();
  await expect(page.getByRole("listbox")).toBeHidden();
});
