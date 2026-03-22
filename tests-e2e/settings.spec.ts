import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { setupMocks, ALL_CONNECTOR_FIXTURES } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
})

test("language selector switches app to German", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  const languageGroup = page.locator("[role='radiogroup']").first()
  await languageGroup.getByRole("radio", { name: "Deutsch" }).click()

  // Settings heading should now be in German
  await expect(page.getByRole("heading", { name: "Einstellungen" })).toBeVisible()
})

test("language selector switches app to English", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  // Switch to German first
  const languageGroup = page.locator("[role='radiogroup']").first()
  await languageGroup.getByRole("radio", { name: "Deutsch" }).click()
  await expect(page.getByRole("heading", { name: "Einstellungen" })).toBeVisible()

  // Switch back to English
  await languageGroup.getByRole("radio", { name: "English" }).click()
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
})

test("language preference persists across page reload", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  const languageGroup = page.locator("[role='radiogroup']").first()
  await languageGroup.getByRole("radio", { name: "Deutsch" }).click()

  await page.reload()

  await expect(page.getByRole("heading", { name: "Einstellungen" })).toBeVisible()
})

test("theme toggle switches to dark mode", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  const themeGroup = page.locator("[role='radiogroup'][aria-label]").nth(1)
  await themeGroup.getByRole("radio", { name: "Dark" }).click()

  await expect(page.locator("html")).toHaveClass(/dark/)
})

test("theme toggle switches to light mode", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  const themeGroup = page.locator("[role='radiogroup'][aria-label]").nth(1)

  // Switch to dark first
  await themeGroup.getByRole("radio", { name: "Dark" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)

  // Switch back to light
  await themeGroup.getByRole("radio", { name: "Light" }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
})

test("disable source removes its articles from feed", async ({ page }) => {
  const nav = page.locator("nav")

  // First confirm Digitec articles exist on feed
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).toBeVisible()

  // Go to settings and uncheck Digitec
  await nav.getByRole("link", { name: /settings/i }).click()
  await page.getByLabel("Digitec").uncheck()

  // Go back to feed
  await nav.getByRole("link", { name: /feed/i }).first().click()

  // Digitec articles should be gone
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).not.toBeVisible()
})

test("re-enable source restores its articles after refresh", async ({ page }) => {
  const nav = page.locator("nav")

  // Disable Digitec
  await nav.getByRole("link", { name: /settings/i }).click()
  await page.getByLabel("Digitec").uncheck()

  // Re-enable Digitec
  await page.getByLabel("Digitec").check()

  // Go to feed
  await nav.getByRole("link", { name: /feed/i }).first().click()

  // Reload to trigger re-fetch
  await page.reload()
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(page.locator("article").first()).toBeVisible()

  // Digitec articles should be back
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).toBeVisible()
})
