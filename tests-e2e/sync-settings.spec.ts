import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
})

test("unauthenticated user sees auth form on settings page, no sync controls", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  const syncSection = page.getByTestId("sync-settings")
  await expect(syncSection).toBeVisible()

  // Auth form elements
  await expect(page.getByTestId("sync-email-input")).toBeVisible()
  await expect(page.getByTestId("send-magic-link-button")).toBeVisible()

  // Sync controls should not be visible
  await expect(page.getByTestId("sync-now-button")).not.toBeVisible()
  await expect(page.getByTestId("sign-out-button")).not.toBeVisible()
})

test("settings page displays sync section structure", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  // Heading
  await expect(page.getByRole("heading", { name: /cross-device sync/i })).toBeVisible()

  // Description text
  await expect(page.getByText(/sync your hidden articles/i)).toBeVisible()

  // Email input
  const emailInput = page.getByTestId("sync-email-input")
  await expect(emailInput).toBeVisible()
  await expect(emailInput).toHaveAttribute("type", "email")

  // Send button
  await expect(page.getByTestId("send-magic-link-button")).toBeVisible()
})

test("settings nav icon is a cog when unauthenticated", async ({ page }) => {
  const nav = page.locator("nav")
  const settingsLink = nav.getByRole("link", { name: /settings/i })

  // The link should contain an SVG (the settings cog icon)
  const svg = settingsLink.locator("svg")
  await expect(svg.first()).toBeVisible()

  // The SVG should not have animate-spin class (not syncing)
  await expect(svg.first()).not.toHaveClass(/animate-spin/)
})
