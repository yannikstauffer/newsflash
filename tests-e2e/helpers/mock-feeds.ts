import fs from "node:fs"
import path from "node:path"

import type { Page } from "@playwright/test"

const FIXTURES_DIR = path.resolve(import.meta.dirname, "../fixtures")

function readFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), "utf-8")
}

function readPlaceholderPng(): Buffer {
  return fs.readFileSync(path.join(FIXTURES_DIR, "placeholder.png"))
}

/**
 * Intercepts all /api/rss/** requests and returns fixture XML.
 * Unmocked feeds return empty RSS.
 */
export async function mockAllFeeds(
  page: Page,
  fixtureMap: Record<string, string>,
): Promise<void> {
  const emptyXml = readFixture("empty.xml")
  const resolvedFixtures: Record<string, string> = {}
  for (const [pattern, fixtureName] of Object.entries(fixtureMap)) {
    resolvedFixtures[pattern] = readFixture(fixtureName)
  }

  await page.route("**/api/rss/**", (route) => {
    const url = route.request().url()
    for (const [pattern, xml] of Object.entries(resolvedFixtures)) {
      if (url.includes(pattern)) {
        return route.fulfill({
          contentType: "application/xml",
          body: xml,
        })
      }
    }
    return route.fulfill({
      contentType: "application/xml",
      body: emptyXml,
    })
  })
}

/**
 * Intercepts image requests and returns the 1x1 red placeholder PNG.
 */
export async function mockImages(page: Page): Promise<void> {
  const placeholderPng = readPlaceholderPng()

  await page.route("**/*.jpg", (route) => {
    return route.fulfill({
      contentType: "image/png",
      body: placeholderPng,
    })
  })
}

/**
 * Sets up both RSS feed mocking and image mocking.
 */
export async function setupMocks(
  page: Page,
  fixtureMap: Record<string, string>,
): Promise<void> {
  await mockAllFeeds(page, fixtureMap)
  await mockImages(page)
}

/** Default fixture map that mocks all 7 connectors. */
export const ALL_CONNECTOR_FIXTURES: Record<string, string> = {
  "/api/rss/digitec": "digitec.xml",
  "/api/rss/galaxus": "galaxus.xml",
  "/api/rss/srf-": "srf.xml",
  "/api/rss/winfuture": "winfuture.xml",
  "/api/rss/engadget": "engadget.xml",
  "/api/rss/heise": "heise.xml",
  "/api/rss/ubergizmo": "ubergizmo.xml",
}
