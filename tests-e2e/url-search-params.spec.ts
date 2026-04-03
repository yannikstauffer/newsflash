import { expect, test } from "@playwright/test"

import { clearLocalStorage } from "./helpers/local-storage"
import { ALL_CONNECTOR_FIXTURES, setupMocks } from "./helpers/mock-feeds"

test.beforeEach(async ({ page }) => {
  await setupMocks(page, ALL_CONNECTOR_FIXTURES)
})

test("navigate to /?view=all shows all-articles view", async ({ page }) => {
  await page.goto("/?view=all")
  await clearLocalStorage(page)
  await page.goto("/?view=all")
  await expect(page.locator("article").first()).toBeVisible()

  const allArticlesButton = page.getByRole("button", { name: "All articles" })
  await expect(allArticlesButton).toHaveAttribute("aria-pressed", "true")
})

test("navigate to /?q=<term> pre-fills search and filters articles", async ({ page }) => {
  await page.goto("/?view=all&q=Digitec")
  await clearLocalStorage(page)
  await page.goto("/?view=all&q=Digitec")
  await expect(page.locator("article").first()).toBeVisible()

  const searchInput = page.getByLabel("Search articles")
  await expect(searchInput).toHaveValue("Digitec")

  const articles = page.locator("article")
  const count = await articles.count()
  expect(count).toBeGreaterThan(0)

  for (let index = 0; index < count; index++) {
    const text = await articles.nth(index).textContent()
    expect(text?.toLowerCase()).toContain("digitec")
  }
})

test("day navigation updates URL with date param", async ({ page }) => {
  await page.goto("/")
  await clearLocalStorage(page)
  await page.reload()

  await page.getByLabel("Previous day").click()

  await expect(page).toHaveURL(/[&?]date=\d{4}-\d{2}-\d{2}/)
})

test("refresh page with search params preserves state", async ({ page }) => {
  await page.goto("/?view=all")
  await clearLocalStorage(page)
  await page.goto("/?view=all")
  await expect(page.locator("article").first()).toBeVisible()

  const allArticlesButton = page.getByRole("button", { name: "All articles" })
  await expect(allArticlesButton).toHaveAttribute("aria-pressed", "true")

  // Refresh
  await page.reload()

  await expect(page.locator("article").first()).toBeVisible()
  await expect(allArticlesButton).toHaveAttribute("aria-pressed", "true")
})
