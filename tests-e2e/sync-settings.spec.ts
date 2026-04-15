import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { clearLocalStorage, navigateToSettings } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

import type { Page } from "@playwright/test"

async function mockSupabaseAuth(
  page: Page,
  options: { readonly verifyOk: boolean },
): Promise<void> {
  await page.route("**/auth/v1/otp**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    }),
  )
  await page.route("**/auth/v1/verify**", (route) => {
    if (options.verifyOk) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "fake",
          refresh_token: "fake",
          user: { id: "user-1", email: "test@example.com" },
        }),
      })
    }
    return route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "invalid_grant", error_description: "Token has expired" }),
    })
  })
}

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
})

test("unauthenticated user sees auth form on settings page, no sync controls", async ({ page }) => {
  await navigateToSettings(page)

  const syncSection = page.getByTestId("sync-settings")
  await expect(syncSection).toBeVisible()

  await expect(page.getByTestId("sync-email-input")).toBeVisible()
  await expect(page.getByTestId("send-code-button")).toBeVisible()

  await expect(page.getByTestId("sync-now-button")).not.toBeVisible()
  await expect(page.getByTestId("sign-out-button")).not.toBeVisible()
})

test("settings page displays sync section structure", async ({ page }) => {
  await navigateToSettings(page)

  await expect(page.getByRole("heading", { name: /cross-device sync/i })).toBeVisible()
  await expect(page.getByText(/sync your hidden articles/i)).toBeVisible()

  const emailInput = page.getByTestId("sync-email-input")
  await expect(emailInput).toBeVisible()
  await expect(emailInput).toHaveAttribute("type", "email")

  await expect(page.getByTestId("send-code-button")).toBeVisible()
})

test("overflow trigger is visible and not spinning when unauthenticated", async ({ page }) => {
  const overflowTrigger = page.getByTestId("overflow-trigger")
  await expect(overflowTrigger).toBeVisible()

  const svg = overflowTrigger.locator("svg")
  await expect(svg.first()).toBeVisible()
  await expect(svg.first()).not.toHaveClass(/animate-spin/)
})

test("OTP sign-in flow advances to the code step and handles invalid codes", async ({ page }) => {
  await mockSupabaseAuth(page, { verifyOk: false })

  await navigateToSettings(page)

  await page.getByTestId("sync-email-input").fill("test@example.com")
  await page.getByTestId("send-code-button").click()

  const codeInput = page.getByTestId("sync-code-input")
  await expect(codeInput).toBeVisible()
  await expect(codeInput).toHaveAttribute("inputmode", "numeric")
  await expect(codeInput).toHaveAttribute("autocomplete", "one-time-code")
  await expect(codeInput).toHaveAttribute("maxlength", "6")

  // a11y scan of the code-entry form (scoped to the form to exclude pre-existing
  // muted-foreground contrast issues on the shared section description)
  const results = await new AxeBuilder({ page })
    .include('[data-testid="sync-code-form"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze()
  expect(results.violations).toEqual([])

  await codeInput.fill("000000")
  await page.getByTestId("verify-code-button").click()

  await expect(page.getByTestId("sync-code-error")).toBeVisible()
  await expect(codeInput).toBeVisible()

  await page.getByTestId("use-different-email-button").click()
  await expect(page.getByTestId("sync-email-input")).toBeVisible()
  await expect(page.getByTestId("sync-code-input")).not.toBeVisible()
})
