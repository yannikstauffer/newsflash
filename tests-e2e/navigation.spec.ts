import { expect, test } from "@playwright/test"

import { setupMocks, ALL_CONNECTOR_FIXTURES } from "./helpers/mock-feeds"
import { clearLocalStorage } from "./helpers/local-storage"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
})

test("app loads on feed page with Feed tab active", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  const feedTab = nav.locator("button", { hasText: "Feed" })
  await expect(feedTab).toHaveAttribute("aria-current", "page")
  await expect(page.locator("article").first()).toBeVisible()
})

test("switch to Read List tab", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  const readListTab = nav.locator("button", { hasText: "Read List" })

  await readListTab.click()

  await expect(readListTab).toHaveAttribute("aria-current", "page")
  await expect(
    page.getByText("No saved articles yet"),
  ).toBeVisible()
})

test("switch to Settings tab", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  const settingsTab = nav.locator("button", { hasText: "Settings" })

  await settingsTab.click()

  await expect(settingsTab).toHaveAttribute("aria-current", "page")
  await expect(page.getByText("Language")).toBeVisible()
  await expect(page.getByText("Appearance")).toBeVisible()
  await expect(page.getByText("Sources")).toBeVisible()
})

test("switching tabs updates active indicator", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  const feedTab = nav.locator("button", { hasText: "Feed" })
  const readListTab = nav.locator("button", { hasText: "Read List" })
  const settingsTab = nav.locator("button", { hasText: "Settings" })

  await readListTab.click()
  await expect(readListTab).toHaveAttribute("aria-current", "page")
  await expect(feedTab).not.toHaveAttribute("aria-current", "page")

  await settingsTab.click()
  await expect(settingsTab).toHaveAttribute("aria-current", "page")
  await expect(readListTab).not.toHaveAttribute("aria-current", "page")

  await feedTab.click()
  await expect(feedTab).toHaveAttribute("aria-current", "page")
  await expect(settingsTab).not.toHaveAttribute("aria-current", "page")
})
