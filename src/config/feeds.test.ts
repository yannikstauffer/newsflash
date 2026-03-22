import { describe, expect, it } from "vitest"

import { feedProxyPath, feedUrls } from "./feeds"

describe("feedUrls", () => {
  const expectedFeedIds = [
    "digitec",
    "galaxus",
    "srf-latest",
    "srf-switzerland",
    "srf-international",
    "srf-economy",
    "srf-news",
    "srf-sport",
    "srf-football",
    "srf-ice-hockey",
    "srf-tennis",
    "srf-ski",
    "srf-athletics",
    "srf-motorsport",
    "srf-more-sport",
    "srf-culture",
    "srf-film",
    "srf-society",
    "srf-literature",
    "srf-music",
    "srf-art",
    "srf-theater",
    "srf-technology",
    "srf-health",
    "srf-sustainability",
    "srf-humanity",
    "srf-nature",
    "srf-knowledge",
    "winfuture",
    "engadget",
    "heise",
    "ubergizmo",
  ]

  it("contains exactly 32 feed entries", () => {
    expect(Object.keys(feedUrls)).toHaveLength(32)
  })

  it.each(expectedFeedIds)("contains feed ID '%s'", (feedId) => {
    expect(feedUrls[feedId]).toBeDefined()
    expect(feedUrls[feedId]).toMatch(/^https?:\/\//)
  })
})

describe("feedProxyPath", () => {
  it("returns /api/rss/<feedId> for a given feed ID", () => {
    expect(feedProxyPath("engadget")).toBe("/api/rss/engadget")
  })

  it("handles hyphenated feed IDs", () => {
    expect(feedProxyPath("srf-latest")).toBe("/api/rss/srf-latest")
  })

  it("handles arbitrary feed IDs", () => {
    expect(feedProxyPath("my-custom-feed")).toBe("/api/rss/my-custom-feed")
  })
})
