import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { setupMocks, ALL_CONNECTOR_FIXTURES } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
  // Show all articles to have a known set
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(page.locator("article").first()).toBeVisible()
})

test("search narrows results", async ({ page }) => {
  const initialCount = await page.locator("article").count()
  expect(initialCount).toBeGreaterThan(1)

  await page.getByLabel("Search articles").fill("Digitec Inline")

  const filteredCount = await page.locator("article").count()
  expect(filteredCount).toBeLessThan(initialCount)
  await expect(
    page.locator("article", { hasText: "Digitec Inline Image Article" }),
  ).toBeVisible()
})

test("search with no matches shows empty state", async ({ page }) => {
  await page.getByLabel("Search articles").fill("xyznonexistentzyx")

  await expect(page.locator("article")).toHaveCount(0)
})

test("clearing search restores all articles", async ({ page }) => {
  const initialCount = await page.locator("article").count()

  await page.getByLabel("Search articles").fill("Digitec Inline")
  const filteredCount = await page.locator("article").count()
  expect(filteredCount).toBeLessThan(initialCount)

  await page.getByLabel("Search articles").clear()

  const restoredCount = await page.locator("article").count()
  expect(restoredCount).toBe(initialCount)
})

test("All articles toggle shows and hides day navigation", async ({ page }) => {
  const allArticlesButton = page.getByRole("button", { name: "All articles" })

  // Currently toggled on (from beforeEach)
  await expect(allArticlesButton).toHaveAttribute("aria-pressed", "true")
  // Day navigation should be hidden
  await expect(page.getByLabel("Previous day")).not.toBeVisible()

  // Toggle off — day navigation appears
  await allArticlesButton.click()
  await expect(allArticlesButton).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByLabel("Previous day")).toBeVisible()
})

test("day navigation prev/next changes date", async ({ page }) => {
  const allArticlesButton = page.getByRole("button", { name: "All articles" })

  // Toggle off to show day navigation
  await allArticlesButton.click()

  // Get the initial day label text
  const dayLabel = page.locator("span.font-medium.text-foreground")
  const initialText = await dayLabel.textContent()

  // Navigate to previous day
  await page.getByLabel("Previous day").click()
  const previousDayText = await dayLabel.textContent()
  expect(previousDayText).not.toBe(initialText)

  // Navigate back (Next day)
  await page.getByLabel("Next day").click()
  const restoredText = await dayLabel.textContent()
  expect(restoredText).toBe(initialText)
})

test("next day is disabled when on today", async ({ page }) => {
  const allArticlesButton = page.getByRole("button", { name: "All articles" })

  // Toggle off to show day navigation (starts on today)
  await allArticlesButton.click()

  await expect(page.getByLabel("Next day")).toBeDisabled()
})

test("show hidden toggle reveals hidden articles as dimmed", async ({ page }, testInfo) => {
  // This test uses hover-based hide button, skip on mobile
  test.skip(testInfo.project.name === "mobile-chrome", "Hide button requires hover")

  // Hide the first article
  const firstCard = page.locator("article").first()
  const firstTitle = await firstCard.locator("h3").textContent()
  await firstCard.hover()
  await page.getByLabel("Hide article").first().click()

  // Article should disappear
  await expect(page.locator("article", { hasText: firstTitle! })).not.toBeVisible()

  // Toggle "Hidden" to show hidden articles
  await page.getByRole("button", { name: "Hidden" }).click()

  // The hidden article should be visible again, dimmed (opacity-50)
  const hiddenCard = page.locator("article", { hasText: firstTitle! })
  await expect(hiddenCard).toBeVisible()
  await expect(hiddenCard).toHaveClass(/opacity-50/)
})
