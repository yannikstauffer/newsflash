import { expect, test } from "@playwright/test"

import { setupSingleConnector } from "./helpers/connector-setup"
import { clearLocalStorage } from "./helpers/local-storage"
import { mockImages } from "./helpers/mock-feeds"

interface ConnectorTestCase {
  readonly id: string
  readonly name: string
  readonly expectedArticles: number
  readonly allHaveImages: boolean
}

const CONNECTORS: ConnectorTestCase[] = [
  { id: "digitec", name: "digitec", expectedArticles: 2, allHaveImages: true },
  { id: "galaxus", name: "galaxus", expectedArticles: 2, allHaveImages: true },
  { id: "srf", name: "srf", expectedArticles: 2, allHaveImages: true },
  { id: "winfuture", name: "winfuture", expectedArticles: 2, allHaveImages: true },
  { id: "engadget", name: "engadget", expectedArticles: 2, allHaveImages: true },
  { id: "heise", name: "heise", expectedArticles: 2, allHaveImages: true },
  { id: "ubergizmo", name: "ubergizmo", expectedArticles: 2, allHaveImages: false },
]

for (const connector of CONNECTORS) {
  test.describe(`Connector: ${connector.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await mockImages(page)
      await page.goto("/")
      await clearLocalStorage(page)
      await setupSingleConnector(page, connector.id)
      await page.reload()
      await page.getByRole("button", { name: "All articles" }).click()
      await expect(page.locator("article").first()).toBeVisible()
    })

    test("renders complete article cards", async ({ page }) => {
      const cards = page.locator("article")
      await expect(cards).toHaveCount(connector.expectedArticles)

      for (let index = 0; index < connector.expectedArticles; index++) {
        const card = cards.nth(index)

        // Title inside a link
        const titleLink = card.locator("a[target='_blank'] h3")
        await expect(titleLink).toBeVisible()
        await expect(titleLink).not.toBeEmpty()

        // Source label matches connector name
        const source = card.locator("span.font-medium").first()
        await expect(source).toHaveText(connector.name)

        // Timestamp with dateTime
        const time = card.locator("time")
        await expect(time).toBeVisible()
        const dateTime = await time.getAttribute("dateTime")
        expect(dateTime).toBeTruthy()

        // Description
        const description = card.locator("p")
        await expect(description).toBeVisible()
      }
    })

    if (connector.allHaveImages) {
      test("all articles have loaded thumbnails", async ({ page }) => {
        const images = page.locator("article img")
        await expect(images).toHaveCount(connector.expectedArticles)

        for (let index = 0; index < connector.expectedArticles; index++) {
          const naturalWidth = await images.nth(index).evaluate(
            (img: HTMLImageElement) => img.naturalWidth,
          )
          expect(naturalWidth).toBeGreaterThan(0)
        }
      })
    }

    if (connector.id === "ubergizmo") {
      test("validates image and no-image cards", async ({ page }) => {
        // Article with image
        const imageCard = page.locator("article", {
          hasText: "Ubergizmo With Image Article",
        })
        await expect(imageCard.locator("img")).toHaveCount(1)
        const naturalWidth = await imageCard
          .locator("img")
          .evaluate((img: HTMLImageElement) => img.naturalWidth)
        expect(naturalWidth).toBeGreaterThan(0)

        // Article without image
        const noImageCard = page.locator("article", {
          hasText: "Ubergizmo No Image Article",
        })
        await expect(noImageCard.locator("img")).toHaveCount(0)
      })
    }
  })
}
