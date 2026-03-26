import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(page.locator("article").first()).toBeVisible()
})

test.describe("desktop button actions", () => {
  test.beforeEach(async ({ page: _page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip()
    }
  })

  test("hide and unhide article flow", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    // Hide
    await firstCard.hover()
    await page.getByLabel("Hide article").first().click()
    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).not.toBeVisible()

    // Show hidden, unhide
    await page.getByRole("button", { name: "Hidden" }).click()
    const hiddenCard = page.locator("article", { hasText: firstTitle! })
    await expect(hiddenCard).toBeVisible()
    await hiddenCard.hover()
    await page.getByLabel("Unhide article").first().click()

    // Toggle hidden off — article back
    await page.getByRole("button", { name: "Hidden" }).click()
    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible()
  })

  test("save article and verify in read list", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    // Save
    await firstCard.hover()
    await page.getByLabel("Save to read list").first().click()

    // Saved article remains visible in feed (save ≠ hide)
    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible()

    // Verify in read list
    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.getByRole("link", { name: /read list/i }).click()
    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible()
  })

  test("empty read list shows guidance message", async ({ page }) => {
    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.getByRole("link", { name: /read list/i }).click()

    await expect(
      page.getByText("No saved articles yet"),
    ).toBeVisible()
  })
})

test.describe("mobile swipe actions", () => {
  test.beforeEach(async ({ page: _page }, testInfo) => {
    if (testInfo.project.name !== "mobile-chrome") {
      test.skip()
    }
  })

  test("swipe right hides article", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()
    const box = await firstCard.boundingBox()
    if (!box) throw new Error("Could not get article bounding box")

    const startX = box.x + 30
    const startY = box.y + box.height / 2
    const endX = startX + 200

    const client = await page.context().newCDPSession(page)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: startX, y: startY }],
    })
    for (let step = 1; step <= 10; step++) {
      const currentX = startX + (endX - startX) * (step / 10)
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: currentX, y: startY }],
      })
    }
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    })

    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).not.toBeVisible({ timeout: 5000 })
  })

  test("swipe left saves article", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()
    const box = await firstCard.boundingBox()
    if (!box) throw new Error("Could not get article bounding box")

    const startX = box.x + box.width - 30
    const startY = box.y + box.height / 2
    const endX = startX - 200

    const client = await page.context().newCDPSession(page)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: startX, y: startY }],
    })
    for (let step = 1; step <= 10; step++) {
      const currentX = startX + (endX - startX) * (step / 10)
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: currentX, y: startY }],
      })
    }
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    })

    // Saved article remains visible in feed (save ≠ hide)
    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible({ timeout: 5000 })

    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.getByRole("link", { name: /read list/i }).click()

    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible({ timeout: 5000 })
  })
})
