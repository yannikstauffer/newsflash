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
    "srf-sport",
    "srf-football",
    "srf-culture",
    "srf-technology",
    "winfuture",
    "engadget",
    "heise",
    "ubergizmo",
  ]

  it("contains exactly 14 feed entries", () => {
    expect(Object.keys(feedUrls)).toHaveLength(14)
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
