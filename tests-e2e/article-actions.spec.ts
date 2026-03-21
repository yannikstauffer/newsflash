import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { setupMocks, ALL_CONNECTOR_FIXTURES } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(page.locator("article").first()).toBeVisible()
})

// Desktop-only tests: hover-based button actions
test.describe("desktop button actions", () => {
  test.beforeEach(async ({ page: _page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip()
    }
  })

  test("hide article via button", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    await firstCard.hover()
    await page.getByLabel("Hide article").first().click()

    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).not.toBeVisible()
  })

  test("save article via button", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    await firstCard.hover()
    await page.getByLabel("Save to read list").first().click()

    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.locator("button", { hasText: "Read List" }).click()

    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible()
  })

  test("hide article via H key", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    await firstCard.hover()
    await page.keyboard.press("h")

    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).not.toBeVisible()
  })

  test("save article via S key", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    await firstCard.hover()
    await page.keyboard.press("s")

    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.locator("button", { hasText: "Read List" }).click()

    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible()
  })

  test("unhide article from hidden view", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    // Hide it
    await firstCard.hover()
    await page.getByLabel("Hide article").first().click()
    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).not.toBeVisible()

    // Show hidden articles
    await page.getByRole("button", { name: "Hidden" }).click()

    // Unhide it
    const hiddenCard = page.locator("article", { hasText: firstTitle! })
    await hiddenCard.hover()
    await page.getByLabel("Unhide article").first().click()

    // Toggle hidden off
    await page.getByRole("button", { name: "Hidden" }).click()

    // Article should be back
    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible()
  })

  test("read list shows saved articles", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()

    await firstCard.hover()
    await page.getByLabel("Save to read list").first().click()

    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.locator("button", { hasText: "Read List" }).click()

    const savedCard = page.locator("article", { hasText: firstTitle! })
    await expect(savedCard).toBeVisible()
  })

  test("remove article from read list", async ({ page }) => {
    const firstCard = page.locator("article").first()
    const _firstTitle = await firstCard.locator("h3").textContent()

    // Save first
    await firstCard.hover()
    await page.getByLabel("Save to read list").first().click()

    // Go to read list
    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.locator("button", { hasText: "Read List" }).click()

    // Remove
    await page.getByLabel("Remove from read list").first().click()

    // Should show empty message
    await expect(
      page.getByText("No saved articles yet"),
    ).toBeVisible()
  })

  test("show hidden toggle reveals hidden articles as dimmed", async ({ page }) => {
    // Hide the first article
    const firstCard = page.locator("article").first()
    const firstTitle = await firstCard.locator("h3").textContent()
    await firstCard.hover()
    await page.getByLabel("Hide article").first().click()

    // Article should disappear
    await expect(page.locator("article", { hasText: firstTitle! })).not.toBeVisible()

    // Toggle "Hidden" to show hidden articles
    await page.getByRole("button", { name: "Hidden" }).click()

    // The hidden article should be visible again, dimmed (opacity-50)
    const hiddenCard = page.locator("article", { hasText: firstTitle! })
    await expect(hiddenCard).toBeVisible()
    await expect(hiddenCard).toHaveClass(/opacity-50/)
  })
})

test("empty read list shows guidance message", async ({ page }) => {
  const nav = page.locator("nav[aria-label='Main navigation']")
  await nav.locator("button", { hasText: "Read List" }).click()

  await expect(
    page.getByText("No saved articles yet"),
  ).toBeVisible()
})

// Mobile-only tests: swipe gestures
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

    // Simulate touch swipe using CDP Input.dispatchTouchEvent
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

    // Navigate to Read List
    const nav = page.locator("nav[aria-label='Main navigation']")
    await nav.locator("button", { hasText: "Read List" }).click()

    await expect(
      page.locator("article", { hasText: firstTitle! }),
    ).toBeVisible({ timeout: 5000 })
  })
})
