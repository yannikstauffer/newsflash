import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
})

test("language: switch between German and English", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  const languageGroup = page.locator("[role='radiogroup']").first()

  // Switch to German
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

test("theme: toggle between dark and light", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  const themeGroup = page.locator("[role='radiogroup'][aria-label]").nth(1)

  // Dark
  await themeGroup.getByRole("radio", { name: "Dark" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)

  // Light
  await themeGroup.getByRole("radio", { name: "Light" }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
})

test("source: disable and re-enable removes and restores articles", async ({ page }) => {
  const nav = page.locator("nav")

  // Confirm Digitec articles exist
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).toBeVisible()

  // Disable Digitec
  await nav.getByRole("link", { name: /settings/i }).click()
  await page.getByLabel("Digitec").uncheck()

  // Go to feed — Digitec gone
  await nav.getByRole("link", { name: /feed/i }).first().click()
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).not.toBeVisible()

  // Re-enable Digitec
  await nav.getByRole("link", { name: /settings/i }).click()
  await page.getByLabel("Digitec").check()

  // Go to feed and reload
  await nav.getByRole("link", { name: /feed/i }).first().click()
  await page.reload()
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(page.locator("article").first()).toBeVisible()

  // Digitec back
  await expect(
    page.locator("article", { hasText: "Digitec Inline" }),
  ).toBeVisible()
})
