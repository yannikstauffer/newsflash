import { describe, expect, it } from "vitest"

import { filterByDay } from "./filter-by-day"

import type { NormalizedArticle } from "@/features/connectors/types"

function makeArticle(publishedAt: Date, id?: string): NormalizedArticle {
  return {
    id: id ?? "article-1",
    title: "Test Article",
    description: "A description",
    link: "https://example.com/test",
    publishedAt,
    source: "engadget",
    language: "en",
  }
}

describe("filterByDay", () => {
  it("returns articles published on the same day", () => {
    const target = new Date(2026, 2, 20)
    const articles = [
      makeArticle(new Date(2026, 2, 20, 9, 0, 0), "morning"),
      makeArticle(new Date(2026, 2, 20, 18, 30, 0), "evening"),
      makeArticle(new Date(2026, 2, 19, 23, 59, 59), "previous-day"),
    ]

    const result = filterByDay(articles, target)

    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toEqual(["morning", "evening"])
  })

  it("handles cross-midnight boundary — 00:00:00 belongs to the new day", () => {
    const target = new Date(2026, 2, 21)
    const articles = [
      makeArticle(new Date(2026, 2, 20, 23, 59, 59), "before-midnight"),
      makeArticle(new Date(2026, 2, 21, 0, 0, 0), "at-midnight"),
      makeArticle(new Date(2026, 2, 21, 0, 0, 1), "after-midnight"),
    ]

    const result = filterByDay(articles, target)

    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toEqual(["at-midnight", "after-midnight"])
  })

  it("returns empty array when no articles match the day", () => {
    const target = new Date(2026, 2, 22)
    const articles = [
      makeArticle(new Date(2026, 2, 20, 12, 0, 0), "different-day"),
    ]

    const result = filterByDay(articles, target)

    expect(result).toEqual([])
  })

  it("returns empty array when given no articles", () => {
    const result = filterByDay([], new Date(2026, 2, 20))

    expect(result).toEqual([])
  })

  it("matches by year/month/day, ignoring time", () => {
    const target = new Date(2026, 2, 20, 15, 30, 45)
    const articles = [
      makeArticle(new Date(2026, 2, 20, 0, 0, 0), "start"),
      makeArticle(new Date(2026, 2, 20, 23, 59, 59), "end"),
    ]

    const result = filterByDay(articles, target)

    expect(result).toHaveLength(2)
  })
})
