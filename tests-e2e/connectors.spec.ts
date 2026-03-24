import { expect, test } from "@playwright/test"

import { seedSingleConnector } from "./helpers/connector-setup"
import { clearLocalStorage } from "./helpers/local-storage"
import { mockImages } from "./helpers/mock-feeds"

interface ConnectorTestCase {
  readonly id: string
  readonly name: string
  readonly allHaveImages: boolean
}

const CONNECTORS: ConnectorTestCase[] = [
  { id: "digitec", name: "digitec", allHaveImages: true },
  { id: "galaxus", name: "galaxus", allHaveImages: true },
  { id: "srf", name: "srf", allHaveImages: true },
  { id: "winfuture", name: "winfuture", allHaveImages: true },
  { id: "engadget", name: "engadget", allHaveImages: true },
  { id: "heise", name: "heise", allHaveImages: true },
  { id: "ubergizmo", name: "ubergizmo", allHaveImages: false },
]

for (const connector of CONNECTORS) {
  test(`${connector.name}: articles render${connector.allHaveImages ? " with thumbnails" : ""}`, async ({ page }) => {
    await mockImages(page)
    await page.goto("/")
    await clearLocalStorage(page)
    await seedSingleConnector(page, connector.id)
    await page.reload()
    await page.getByRole("button", { name: "All articles" }).click()
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15_000 })

    const articles = page.locator("article")
    const count = await articles.count()
    expect(count).toBeGreaterThan(0)

    if (connector.allHaveImages) {
      const images = page.locator("article img")
      const imageCount = await images.count()
      expect(imageCount).toBeGreaterThan(0)

      for (let index = 0; index < imageCount; index++) {
        const naturalWidth = await images.nth(index).evaluate(
          (img: HTMLImageElement) => img.naturalWidth,
        )
        expect(naturalWidth).toBeGreaterThan(0)
      }
    }
  })
}
