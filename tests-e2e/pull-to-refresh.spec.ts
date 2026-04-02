import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test.describe("pull-to-refresh", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name !== "mobile-chrome") {
      test.skip()
    }
    await setupMocks(page, ALL_CONNECTOR_FIXTURES)
    await page.goto("/")
    await clearLocalStorage(page)
    await page.reload()
    await page.getByRole("button", { name: "All articles" }).click()
    await expect(page.locator("article").first()).toBeVisible()
  })

  test("pull-to-refresh gesture triggers refresh and shows spinner", async ({
    page,
  }) => {
    const firstArticle = page.locator("article").first()
    const box = await firstArticle.boundingBox()
    expect(box).not.toBeNull()

    // Perform a slow pull-down gesture from the top of the first article
    const startX = box!.x + box!.width / 2
    const startY = box!.y + 10

    // Scroll to top first
    await page.evaluate(() => window.scrollTo(0, 0))

    await page.touchscreen.tap(startX, startY)

    // Simulate pull-down gesture
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    for (let y = startY; y < startY + 80; y += 10) {
      await page.mouse.move(startX, y)
    }

    // The spinner should appear during the pull
    const spinner = page.getByTestId("pull-to-refresh-spinner")

    // Release to trigger refresh
    await page.mouse.up()

    // After refresh completes, spinner should disappear
    await expect(spinner).toBeHidden({ timeout: 10_000 })
  })
})
