import { expect, test } from "@playwright/test"

import { seedSingleConnector } from "./helpers/connector-setup"
import { clearLocalStorage } from "./helpers/local-storage"

type ImageExpectation = "all" | "some" | "none"

interface ConnectorTestCase {
  readonly id: string
  readonly name: string
  readonly images: ImageExpectation
}

const IMAGE_LABEL: Record<ImageExpectation, string> = {
  all: " with thumbnails",
  some: " with thumbnails",
  none: "",
}

const CONNECTORS: ConnectorTestCase[] = [
  { id: "digitec", name: "digitec", images: "all" },
  { id: "galaxus", name: "galaxus", images: "all" },
  { id: "srf", name: "srf", images: "all" },
  { id: "winfuture", name: "winfuture", images: "all" },
  { id: "engadget", name: "engadget", images: "all" },
  { id: "heise", name: "heise", images: "some" },
  { id: "ubergizmo", name: "ubergizmo", images: "none" },
]

for (const connector of CONNECTORS) {
  test(`${connector.name}: articles render${IMAGE_LABEL[connector.images]}`, async ({ page }) => {
    await page.goto("/")
    await clearLocalStorage(page)
    await seedSingleConnector(page, connector.id)
    await page.reload()
    await page.getByRole("button", { name: "All articles" }).click()
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15_000 })

    const articles = page.locator("article")
    const count = await articles.count()
    expect(count).toBeGreaterThan(0)

    if (connector.images !== "none") {
      const images = page.locator("article img")
      const imageCount = await images.count()
      expect(imageCount).toBeGreaterThan(0)

      if (connector.images === "all") {
        expect(imageCount).toBe(count)
      }
    }
  })
}
