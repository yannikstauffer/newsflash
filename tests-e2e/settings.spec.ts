import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { setupMocks, ALL_CONNECTOR_FIXTURES } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
})

test("language filter DE shows only German articles", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  await nav.locator("button", { hasText: "Settings" }).click()

  // Select DE language
  const languageGroup = page.locator("[role='radiogroup'][aria-label='Language preference']")
  await languageGroup.getByRole("radio", { name: "DE" }).click()

  // Go back to feed
  await nav.locator("button", { hasText: "Feed" }).click()
  await page.getByRole("button", { name: "All articles" }).click()

  // Should not see English-only connectors (Engadget, Ubergizmo)
  await expect(page.locator("article").first()).toBeVisible()
  await expect(
    page.locator("article", { hasText: "Engadget" }),
  ).not.toBeVisible()
  await expect(
    page.locator("article", { hasText: "Ubergizmo" }),
  ).not.toBeVisible()
})

test("language filter EN shows only English articles", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  await nav.locator("button", { hasText: "Settings" }).click()

  const languageGroup = page.locator("[role='radiogroup'][aria-label='Language preference']")
  await languageGroup.getByRole("radio", { name: "EN" }).click()

  await nav.locator("button", { hasText: "Feed" }).click()
  await page.getByRole("button", { name: "All articles" }).click()

  // Should see English articles but not German
  await expect(page.locator("article").first()).toBeVisible()
  await expect(
    page.locator("article", { hasText: "Digitec" }),
  ).not.toBeVisible()
  await expect(
    page.locator("article", { hasText: "SRF" }),
  ).not.toBeVisible()
})

test("theme toggle switches to dark mode", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  await nav.locator("button", { hasText: "Settings" }).click()

  const themeGroup = page.locator("[role='radiogroup'][aria-label='Theme preference']")
  await themeGroup.getByRole("radio", { name: "dark" }).click()

  await expect(page.locator("html")).toHaveClass(/dark/)
})

test("theme toggle switches to light mode", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  await nav.locator("button", { hasText: "Settings" }).click()

  const themeGroup = page.locator("[role='radiogroup'][aria-label='Theme preference']")

  // Switch to dark first
  await themeGroup.getByRole("radio", { name: "dark" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)

  // Switch back to light
  await themeGroup.getByRole("radio", { name: "light" }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
})

test("disable source removes its articles from feed", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")

  // First confirm Digitec articles exist on feed
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).toBeVisible()

  // Go to settings and uncheck Digitec
  await nav.locator("button", { hasText: "Settings" }).click()
  await page.getByLabel("Digitec").uncheck()

  // Go back to feed
  await nav.locator("button", { hasText: "Feed" }).click()

  // Digitec articles should be gone
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).not.toBeVisible()
})

test("re-enable source restores its articles after refresh", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")

  // Disable Digitec
  await nav.locator("button", { hasText: "Settings" }).click()
  await page.getByLabel("Digitec").uncheck()

  // Re-enable Digitec
  await page.getByLabel("Digitec").check()

  // Go to feed
  await nav.locator("button", { hasText: "Feed" }).click()

  // Reload to trigger re-fetch
  await page.reload()
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(page.locator("article").first()).toBeVisible()

  // Digitec articles should be back
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).toBeVisible()
})
