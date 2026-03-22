import { describe, expect, it } from "vitest"

import { filterArticles } from "./filter-articles"

import type { FilterOptions } from "./filter-articles"
import type { NormalizedArticle } from "@/features/connectors/types"

function makeArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    id: "abc123",
    title: "Test Article",
    description: "A description",
    link: "https://example.com/test",
    publishedAt: new Date("2024-01-01"),
    source: "engadget",
    language: "en",
    ...overrides,
  }
}

const defaultOptions: FilterOptions = {
  isFeedEnabled: () => true,
  showHidden: false,
  hiddenIds: [],
  searchQuery: "",
}

describe("filterArticles", () => {
  it("returns all articles when no filters are active", () => {
    const articles = [makeArticle(), makeArticle({ id: "def456", source: "heise" })]

    const result = filterArticles(articles, defaultOptions)

    expect(result).toHaveLength(2)
  })

  it("filters by source", () => {
    const articles = [
      makeArticle({ source: "engadget" }),
      makeArticle({ id: "2", source: "heise" }),
      makeArticle({ id: "3", source: "srf" }),
    ]

    const result = filterArticles(articles, {
      ...defaultOptions,
      isFeedEnabled: (id: string) => id === "engadget",
    })

    expect(result).toHaveLength(1)
    expect(result[0].source).toBe("engadget")
  })

  it("shows articles of all languages regardless of article language", () => {
    const articles = [
      makeArticle({ language: "en" }),
      makeArticle({ id: "2", language: "de", source: "heise" }),
    ]

    const result = filterArticles(articles, defaultOptions)

    expect(result).toHaveLength(2)
  })

  it("hides hidden articles when showHidden is false", () => {
    const articles = [
      makeArticle({ id: "hidden1" }),
      makeArticle({ id: "visible1" }),
    ]

    const result = filterArticles(articles, {
      ...defaultOptions,
      hiddenIds: ["hidden1"],
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("visible1")
  })

  it("shows hidden articles when showHidden is true", () => {
    const articles = [
      makeArticle({ id: "hidden1" }),
      makeArticle({ id: "visible1" }),
    ]

    const result = filterArticles(articles, {
      ...defaultOptions,
      showHidden: true,
      hiddenIds: ["hidden1"],
    })

    expect(result).toHaveLength(2)
  })

  it("filters by search query in title (case-insensitive)", () => {
    const articles = [
      makeArticle({ title: "Apple releases new iPhone" }),
      makeArticle({ id: "2", title: "Google announces Android" }),
    ]

    const result = filterArticles(articles, {
      ...defaultOptions,
      searchQuery: "apple",
    })

    expect(result).toHaveLength(1)
    expect(result[0].title).toContain("Apple")
  })

  it("filters by search query in description", () => {
    const articles = [
      makeArticle({ title: "Tech News", description: "Apple launched a product" }),
      makeArticle({ id: "2", title: "Other", description: "Unrelated content" }),
    ]

    const result = filterArticles(articles, {
      ...defaultOptions,
      searchQuery: "apple",
    })

    expect(result).toHaveLength(1)
  })

  it("shows all when search query is empty", () => {
    const articles = [makeArticle(), makeArticle({ id: "2" })]

    const result = filterArticles(articles, {
      ...defaultOptions,
      searchQuery: "",
    })

    expect(result).toHaveLength(2)
  })

  it("combines all filters with AND logic", () => {
    const articles = [
      makeArticle({ id: "1", source: "engadget", language: "en", title: "Apple news" }),
      makeArticle({ id: "2", source: "srf", language: "de", title: "Apple Nachrichten" }),
      makeArticle({ id: "3", source: "engadget", language: "en", title: "Google news" }),
      makeArticle({ id: "4", source: "heise", language: "de", title: "Apple Test" }),
    ]

    const result = filterArticles(articles, {
      isFeedEnabled: (id: string) => id === "engadget" || id === "srf",
      showHidden: false,
      hiddenIds: [],
      searchQuery: "apple",
    })

    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toEqual(["1", "2"])
  })
})
