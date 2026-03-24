import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test("full tab cycle: Feed → Read List → Settings → Feed", async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(page.locator("article").first()).toBeVisible()

  const nav = page.locator("nav[aria-label='Main navigation']")
  const feedTab = nav.getByRole("link", { name: /feed/i })
  const readListTab = nav.getByRole("link", { name: /read list/i })
  const settingsTab = nav.getByRole("link", { name: /settings/i })

  // Starts on Feed
  await expect(feedTab).toHaveAttribute("aria-current", "page")

  // Switch to Read List
  await readListTab.click()
  await expect(readListTab).toHaveAttribute("aria-current", "page")
  await expect(feedTab).not.toHaveAttribute("aria-current", "page")
  await expect(page.getByText("No saved articles yet")).toBeVisible()

  // Switch to Settings
  await settingsTab.click()
  await expect(settingsTab).toHaveAttribute("aria-current", "page")
  await expect(readListTab).not.toHaveAttribute("aria-current", "page")
  await expect(page.getByText("Language")).toBeVisible()
  await expect(page.getByText("Appearance")).toBeVisible()
  await expect(page.getByText("Sources")).toBeVisible()

  // Back to Feed
  await feedTab.click()
  await expect(feedTab).toHaveAttribute("aria-current", "page")
  await expect(settingsTab).not.toHaveAttribute("aria-current", "page")
})
