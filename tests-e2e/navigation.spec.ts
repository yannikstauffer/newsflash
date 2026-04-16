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

  // Starts on Feed
  await expect(feedTab).toHaveAttribute("aria-current", "page")

  // Switch to Read List
  await readListTab.click()
  await expect(readListTab).toHaveAttribute("aria-current", "page")
  await expect(feedTab).not.toHaveAttribute("aria-current", "page")
  await expect(page.getByText("No saved articles yet")).toBeVisible()

  // Switch to Settings via overflow sheet (Settings was moved from nav to overflow menu).
  // Use force: true because @base-ui/react marks #root as data-base-ui-inert when the
  // popover is open, which Playwright's actionability check treats as blocking. The popup
  // is rendered in a Portal outside #root and is clickable in real browsers.
  await page.getByTestId("overflow-trigger").click()
  await page.getByTestId("overflow-settings-item").click({ force: true })
  await expect(page.getByRole("heading", { name: "Language" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible()

  // Back to Feed
  await feedTab.click()
  await expect(feedTab).toHaveAttribute("aria-current", "page")
})
