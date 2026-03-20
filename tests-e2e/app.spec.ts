import { test, expect } from "@playwright/test"

test("should load the app", async ({ page }) => {
  await page.goto("/")

  await expect(page.locator("section#center")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Get started" })).toBeVisible()
})

test("counter button should increment", async ({ page }) => {
  await page.goto("/")

  const button = page.locator("button.counter")
  await expect(button).toBeVisible()
  await expect(button).toHaveText("Count is 0")

  await button.click()
  await expect(button).toHaveText("Count is 1")

  await button.click()
  await expect(button).toHaveText("Count is 2")
})
