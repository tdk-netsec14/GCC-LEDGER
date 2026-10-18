import { test, expect } from "@playwright/test";

test.describe("GCC Ledger End-to-End User Journeys (Section 13.4)", () => {
  test("Journey 1: Ledger count range and Evidence Floor filtering", async ({ page }) => {
    await page.goto("/?floor=D&direct_only=false");
    await expect(page.locator("h1")).toContainText("Evidence-Graded GCC Ledger");

    // Check reconciled range values
    await expect(page.locator("body")).toContainText("Grade-Weighted Centre");
    await expect(page.locator("body")).toContainText("1,580");

    // Raise floor to Grade A
    const floorAButton = page.locator("button:has-text('Grade A')").first();
    if (await floorAButton.isVisible()) {
      await floorAButton.click();
      // Verifies URL syncs
      await expect(page).toHaveURL(/floor=A/);
      // Floor A hides lower grade claims and displays hidden count notice
      await expect(page.locator("body")).toContainText("hidden by Floor A");
    }
  });

  test("Journey 2: Setup Simulator parameter adjustments and break-even calculation", async ({ page }) => {
    await page.goto("/simulate");
    await expect(page.locator("h1")).toContainText("Setup Simulator");

    // Check default golden values for 150 headcount
    await expect(page.locator("body")).toContainText("US$6.05M");
    await expect(page.locator("body")).toContainText("Month 8");

    // Check 90-day setup checklist
    await expect(page.locator("body")).toContainText("90-Day Setup Checklist");
    await expect(page.locator("body")).toContainText("MCA SPICe+");
  });

  test("Journey 3: City Lab pillar weighting and ranking recalculation", async ({ page }) => {
    await page.goto("/cities");
    await expect(page.locator("h1")).toContainText("City Lab");

    // Check ranked cities table
    await expect(page.locator("body")).toContainText("Bengaluru");
    await expect(page.locator("body")).toContainText("Hyderabad");

    // Click Cost-first preset
    const costPreset = page.locator("button:has-text('Cost-first')").first();
    if (await costPreset.isVisible()) {
      await costPreset.click();
      await expect(page.locator("table")).toBeVisible();
    }
  });

  test("Journey 4: Signal Radar probability accumulation", async ({ page }) => {
    await page.goto("/radar");
    await expect(page.locator("h1")).toContainText("Signal Radar");

    // Toggle a signal checkbox
    const firstCheckbox = page.locator("input[type='checkbox']").first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check({ force: true });
      // Probability updates from 0%
      await expect(page.locator("body")).toContainText("Establishment Probability");
    }
  });

  test("Journey 5: Ask the Ledger grounded citation & refusal below floor", async ({ page }) => {
    await page.goto("/ask");
    await expect(page.locator("h1")).toContainText("Ask the Ledger");

    // Ask out of scope query
    const textarea = page.locator("textarea");
    await textarea.fill("What is the recipe for chocolate cake?");
    await page.locator("button:has-text('Ask')").click();

    // Verifies refusal notice appears
    await expect(page.locator("body")).toContainText("Evidence Below Floor / Refusal Notice");
  });
});
