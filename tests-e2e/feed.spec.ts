import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { setupMocks, ALL_CONNECTOR_FIXTURES } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()
  // Click "All articles" to see all articles regardless of day
  await page.getByRole("button", { name: "All articles" }).click()
  await expect(page.locator("article").first()).toBeVisible()
})

test("article cards display all required fields", async ({ page }) => {
  const cards = page.locator("article")
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)

  // Check first card has all expected fields
  const firstCard = cards.first()

  // Title as a link
  const titleLink = firstCard.locator("a[target='_blank'] h3")
  await expect(titleLink).toBeVisible()
  await expect(titleLink).not.toBeEmpty()

  // Source label
  const source = firstCard.locator("span.font-medium").first()
  await expect(source).toBeVisible()

  // Timestamp with dateTime attribute
  const time = firstCard.locator("time")
  await expect(time).toBeVisible()
  const dateTime = await time.getAttribute("dateTime")
  expect(dateTime).toBeTruthy()
  expect(new Date(dateTime!).getTime()).not.toBeNaN()

  // Description
  const description = firstCard.locator("p")
  await expect(description).toBeVisible()
})

test("article cards with images have loaded thumbnails", async ({ page }) => {
  // Find a card that has an image (most fixture articles have images)
  const cardsWithImages = page.locator("article img")
  const count = await cardsWithImages.count()
  expect(count).toBeGreaterThan(0)

  // Verify at least one image has actually loaded (naturalWidth > 0)
  const naturalWidth = await cardsWithImages.first().evaluate(
    (img: HTMLImageElement) => img.naturalWidth,
  )
  expect(naturalWidth).toBeGreaterThan(0)
})

test("article cards without images have no img element", async ({ page }) => {
  // Ubergizmo "No Image Article" should have no <img>
  const noImageCard = page.locator("article", {
    hasText: "Ubergizmo No Image Article",
  })
  await expect(noImageCard).toBeVisible()
  await expect(noImageCard.locator("img")).toHaveCount(0)
})
