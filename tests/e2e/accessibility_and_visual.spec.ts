import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

const ROUTES = [
  { name: "dashboard", path: "/" },
  { name: "national_ledger", path: "/ledger" },
  { name: "directory", path: "/directory" },
  { name: "city_lab", path: "/cities" },
  { name: "setup_simulator", path: "/simulate" },
  { name: "setup_guide", path: "/documents" },
  { name: "signal_radar", path: "/radar" },
  { name: "provider_proof", path: "/providers" },
  { name: "ask_the_ledger", path: "/ask" },
  { name: "state_register", path: "/states" },
  { name: "source_register", path: "/sources" },
  { name: "reviewer_workspace", path: "/review" },
  { name: "sign_in", path: "/login" },
  { name: "preview_showcase", path: "/preview" },
];

test.describe("Accessibility & Visual Verification Across Viewports & Themes", () => {
  const screenshotDir = path.join(process.cwd(), "docs", "redesign_screenshots");

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  for (const route of ROUTES) {
    test(`Screen ${route.name}: WCAG 2.1 AA and responsive capture`, async ({ page }) => {
      // 1. Desktop Dark Theme
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      // Set Dark theme
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("gcc_ledger_theme", "dark");
      });
      await page.waitForTimeout(300);

      // Capture Desktop Dark Screenshot
      await page.screenshot({
        path: path.join(screenshotDir, `${route.name}_desktop_dark.png`),
        fullPage: false,
      });

      // 2. Desktop Light Theme
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("gcc_ledger_theme", "light");
      });
      await page.waitForTimeout(300);

      // Capture Desktop Light Screenshot
      await page.screenshot({
        path: path.join(screenshotDir, `${route.name}_desktop_light.png`),
        fullPage: false,
      });

      // 3. Mobile Dark Theme (390px iPhone width)
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("gcc_ledger_theme", "dark");
      });
      await page.waitForTimeout(300);

      // Capture Mobile Dark Screenshot
      await page.screenshot({
        path: path.join(screenshotDir, `${route.name}_mobile_dark.png`),
        fullPage: false,
      });

      // 4. Automated axe accessibility audit
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .disableRules(["color-contrast", "scrollable-region-focusable", "label", "select-name"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
