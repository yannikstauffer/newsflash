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

    const startX = Math.round(box!.x + box!.width / 2)
    const startY = Math.round(box!.y + 10)

    // Scroll to top first
    await page.evaluate(() => window.scrollTo(0, 0))

    // Simulate pull-down gesture using touch events via CDP
    const client = await page.context().newCDPSession(page)

    // Touch start at the initial position
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: startX, y: startY }],
    })

    // Move down in small increments to simulate a slow pull
    for (let y = startY; y < startY + 80; y += 10) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: startX, y }],
      })
    }

    // The spinner should be visible during the pull
    const spinner = page.getByTestId("pull-to-refresh-spinner")
    await expect(spinner).toBeVisible()

    // Release to trigger refresh
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    })

    // After refresh completes, spinner should disappear
    await expect(spinner).toBeHidden({ timeout: 10_000 })
  })
})
