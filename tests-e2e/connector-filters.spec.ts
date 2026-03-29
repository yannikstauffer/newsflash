import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
})

test("filter toggles appear in settings for connectors with filters", async ({ page }) => {
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()

  // Heise should have filter checkboxes
  const heiseSection = page.locator("div.p-4", { hasText: "Heise" })
  await expect(heiseSection.getByText("heise+ (Bezahlinhalte)")).toBeVisible()
  await expect(heiseSection.getByText("heise-Angebot (Werbung)")).toBeVisible()

  // WinFuture should have filter checkbox
  const winfutureSection = page.locator("div.p-4", { hasText: "WinFuture" })
  await expect(winfutureSection.getByText("Downloads")).toBeVisible()

  // SRF should have a Filters section with category filter switches
  const srfSection = page.locator("div.p-4", { hasText: "SRF" })
  await expect(srfSection.getByText("Filters")).toBeVisible()
  await expect(srfSection.getByRole("switch", { name: "Sport", exact: true })).toBeVisible()
  await expect(srfSection.getByRole("switch", { name: "Kultur", exact: true })).toBeVisible()
  await expect(srfSection.getByRole("switch", { name: "Wissen", exact: true })).toBeVisible()
})

test("disabling SRF sport filter hides sport articles from feed", async ({ page }) => {
  // Sport article should be visible by default (filter enabled)
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(page.locator("article").first()).toBeVisible()
  await expect(
    page.locator("article", { hasText: "SRF Sport: Eishockey Final" }),
  ).toBeVisible()

  // Disable sport filter via settings
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()
  const srfSection = page.locator("div.p-4", { hasText: "SRF" })
  await srfSection.getByRole("switch", { name: "Sport", exact: true }).click()

  // Go to feed — sport article should be gone
  await nav.getByRole("link", { name: /feed/i }).first().click()
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(
    page.locator("article", { hasText: "SRF Sport: Eishockey Final" }),
  ).not.toBeVisible()

  // Non-sport SRF articles should still be visible
  await expect(
    page.locator("article", { hasText: "SRF Media Thumbnail Article" }),
  ).toBeVisible()
})

test("toggling a filter excludes matching articles", async ({ page }) => {
  // heise-Angebot is enabled by default — its articles should be visible
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(page.locator("article").first()).toBeVisible()
  await expect(
    page.locator("article", { hasText: "heise-Angebot: Special Workshop Deal" }),
  ).toBeVisible()

  // heise+ is disabled by default — its articles should NOT be visible
  await expect(
    page.locator("article", { hasText: "heise+ | Premium Paid Article" }),
  ).not.toBeVisible()

  // Disable heise-Angebot filter via settings
  const nav = page.locator("nav")
  await nav.getByRole("link", { name: /settings/i }).click()
  const heiseSection = page.locator("div.p-4", { hasText: "Heise" })
  await heiseSection.getByLabel("heise-Angebot (Werbung)").uncheck()

  // Go to feed — heise-Angebot article should be gone
  await nav.getByRole("link", { name: /feed/i }).first().click()
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(
    page.locator("article", { hasText: "heise-Angebot: Special Workshop Deal" }),
  ).not.toBeVisible()

  // Enable heise+ filter via settings
  await nav.getByRole("link", { name: /settings/i }).click()
  await heiseSection.getByLabel("heise+ (Bezahlinhalte)").check()

  // Go to feed — heise+ article should now be visible
  await nav.getByRole("link", { name: /feed/i }).first().click()
  await page.getByRole("button", { name: /all articles/i }).click()
  await expect(
    page.locator("article", { hasText: "heise+ | Premium Paid Article" }),
  ).toBeVisible()
})
