import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(page.locator("article").first()).toBeVisible()
})

test("search: narrow results, empty state, and clear restores", async ({ page }) => {
  const initialCount = await page.locator("article").count()
  expect(initialCount).toBeGreaterThan(1)

  // Narrow
  await page.getByLabel("Search articles").fill("Digitec Inline")
  const filteredCount = await page.locator("article").count()
  expect(filteredCount).toBeLessThan(initialCount)
  await expect(
    page.locator("article", { hasText: "Digitec Inline Image Article" }),
  ).toBeVisible()

  // Empty state
  await page.getByLabel("Search articles").fill("xyznonexistentzyx")
  await expect(page.locator("article")).toHaveCount(0)

  // Clear restores
  await page.getByLabel("Search articles").clear()
  const restoredCount = await page.locator("article").count()
  expect(restoredCount).toBe(initialCount)
})

test("day navigation: toggle, prev/next, and today disabled", async ({ page }) => {
  const allArticlesButton = page.getByRole("button", { name: "All articles" })

  // Currently toggled on — day nav hidden
  await expect(allArticlesButton).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByLabel("Previous day")).not.toBeVisible()

  // Toggle off — day nav appears, next day disabled (today)
  await allArticlesButton.click()
  await expect(allArticlesButton).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByLabel("Previous day")).toBeVisible()
  await expect(page.getByLabel("Next day")).toBeDisabled()

  // Navigate prev then next
  const dayLabel = page.locator("span.font-medium.text-foreground")
  const initialText = await dayLabel.textContent()

  await page.getByLabel("Previous day").click()
  const previousDayText = await dayLabel.textContent()
  expect(previousDayText).not.toBe(initialText)

  await page.getByLabel("Next day").click()
  const restoredText = await dayLabel.textContent()
  expect(restoredText).toBe(initialText)
})

test("sticky filter bar: remains visible when scrolling", async ({ page }) => {
  // Ensure there are enough articles to scroll
  const articleCount = await page.locator("article").count()
  expect(articleCount).toBeGreaterThan(1)

  // Get the All articles button (inside the sticky filter bar)
  const allArticlesButton = page.getByRole("button", { name: "All articles" })
  await expect(allArticlesButton).toBeVisible()

  // Scroll down to the bottom of the page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  // The filter bar controls should still be visible (sticky)
  await expect(allArticlesButton).toBeVisible()
  await expect(allArticlesButton).toBeInViewport()
})
