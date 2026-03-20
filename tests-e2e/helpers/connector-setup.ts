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
const CONNECTOR_FEEDS: Record<string, string[]> = {
  digitec: ["digitec"],
  galaxus: ["galaxus"],
  srf: [
    "srf-latest",
    "srf-switzerland",
    "srf-international",
    "srf-economy",
    "srf-sport",
    "srf-football",
    "srf-culture",
    "srf-technology",
  ],
  winfuture: ["winfuture"],
  engadget: ["engadget"],
  heise: ["heise"],
  ubergizmo: ["ubergizmo"],
}

/** Maps connector ID to its fixture route pattern and file. */
const CONNECTOR_FIXTURES: Record<string, Record<string, string>> = {
  digitec: { "/api/rss/digitec": "digitec.xml" },
  galaxus: { "/api/rss/galaxus": "galaxus.xml" },
  srf: { "/api/rss/srf-": "srf.xml" },
  winfuture: { "/api/rss/winfuture": "winfuture.xml" },
  engadget: { "/api/rss/engadget": "engadget.xml" },
  heise: { "/api/rss/heise": "heise.xml" },
  ubergizmo: { "/api/rss/ubergizmo": "ubergizmo.xml" },
}

/**
 * Enables only one connector's feeds (disables all others),
 * mocks its RSS feeds with fixture data, and returns empty for the rest.
 */
export async function setupSingleConnector(
  page: Page,
  connectorId: string,
): Promise<void> {
  const feedIds = CONNECTOR_FEEDS[connectorId]
  if (!feedIds) {
    throw new Error(`Unknown connector: ${connectorId}`)
  }

  // Build feed preferences: disable all, then enable target connector
  const preferences: Record<string, boolean> = {}
  for (const feedId of ALL_FEED_IDS) {
    preferences[feedId] = feedIds.includes(feedId)
  }

  // Set up mocks for the target connector's fixture
  const fixtureMap = CONNECTOR_FIXTURES[connectorId]
  if (!fixtureMap) {
    throw new Error(`No fixture map for connector: ${connectorId}`)
  }

  await setupMocks(page, fixtureMap)
  await seedFeedPreferences(page, preferences)
}

export { CONNECTOR_FEEDS, ALL_FEED_IDS }
