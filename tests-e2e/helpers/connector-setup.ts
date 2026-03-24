import { seedFeedPreferences } from "./local-storage"
import { setupMocks } from "./mock-feeds"

import type { Page } from "@playwright/test"

/** All feed IDs across all connectors. */
const ALL_FEED_IDS = [
  "digitec",
  "galaxus",
  "srf-latest",
  "srf-switzerland",
  "srf-international",
  "srf-economy",
  "srf-sport",
  "srf-football",
  "srf-culture",
  "srf-technology",
  "winfuture",
  "engadget",
  "heise",
  "ubergizmo",
]

/** Maps connector ID to its feed IDs. */
const CONNECTOR_FEEDS = new Map<string, string[]>([
  ["digitec", ["digitec"]],
  ["galaxus", ["galaxus"]],
  [
    "srf",
    [
      "srf-latest",
      "srf-switzerland",
      "srf-international",
      "srf-economy",
      "srf-sport",
      "srf-football",
      "srf-culture",
      "srf-technology",
    ],
  ],
  ["winfuture", ["winfuture"]],
  ["engadget", ["engadget"]],
  ["heise", ["heise"]],
  ["ubergizmo", ["ubergizmo"]],
])

/** Maps connector ID to its fixture route pattern and file. */
const CONNECTOR_FIXTURES = new Map<string, Record<string, string>>([
  ["digitec", { "/api/rss/digitec": "digitec.xml" }],
  ["galaxus", { "/api/rss/galaxus": "galaxus.xml" }],
  ["srf", { "/api/rss/srf-": "srf.xml" }],
  ["winfuture", { "/api/rss/winfuture": "winfuture.xml" }],
  ["engadget", { "/api/rss/engadget": "engadget.xml" }],
  ["heise", { "/api/rss/heise": "heise.xml" }],
  ["ubergizmo", { "/api/rss/ubergizmo": "ubergizmo.xml" }],
])

/**
 * Seeds localStorage to enable only one connector's feeds (disables all others).
 * Does NOT mock any network requests — the app will hit real RSS feeds via the Vite proxy.
 */
export async function seedSingleConnector(
  page: Page,
  connectorId: string,
): Promise<void> {
  const feedIds = CONNECTOR_FEEDS.get(connectorId)
  if (!feedIds) {
    throw new Error(`Unknown connector: ${connectorId}`)
  }

  const preferences = new Map<string, boolean>()
  for (const feedId of ALL_FEED_IDS) {
    preferences.set(feedId, feedIds.includes(feedId))
  }

  await seedFeedPreferences(page, Object.fromEntries(preferences))
}

/**
 * Enables only one connector's feeds (disables all others),
 * mocks its RSS feeds with fixture data, and returns empty for the rest.
 */
export async function setupSingleConnector(
  page: Page,
  connectorId: string,
): Promise<void> {
  const feedIds = CONNECTOR_FEEDS.get(connectorId)
  if (!feedIds) {
    throw new Error(`Unknown connector: ${connectorId}`)
  }

  // Build feed preferences: disable all, then enable target connector
  const preferences = new Map<string, boolean>()
  for (const feedId of ALL_FEED_IDS) {
    preferences.set(feedId, feedIds.includes(feedId))
  }

  // Set up mocks for the target connector's fixture
  const fixtureMap = CONNECTOR_FIXTURES.get(connectorId)
  if (!fixtureMap) {
    throw new Error(`No fixture map for connector: ${connectorId}`)
  }

  await setupMocks(page, fixtureMap)
  await seedFeedPreferences(page, Object.fromEntries(preferences))
}

export { CONNECTOR_FEEDS, ALL_FEED_IDS }
