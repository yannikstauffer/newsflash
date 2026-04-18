import { beforeEach, describe, expect, it, vi } from "vitest"

import { fetchAndParseAllFeeds } from "./feed-pipeline"

import type { NormalizedArticle } from "@/features/connectors/types"

vi.mock("@/config/feeds", () => ({
  feedProxyPath: (feedId: string) => `/api/rss/${feedId}`,
}))

vi.mock("@/features/connectors/fetch-feed", () => ({
  fetchFeed: vi.fn(),
}))

vi.mock("@/features/connectors/registry", () => ({
  connectors: [],
}))

import { fetchFeed } from "@/features/connectors/fetch-feed"
import { connectors } from "@/features/connectors/registry"

const mockFetchFeed = vi.mocked(fetchFeed)
const mockConnectors = connectors as unknown as Array<{
  id: string
  name: string
  language: "en"
  feeds: Array<{ id: string; name: string }>
  parse: ReturnType<typeof vi.fn>
}>

function makeArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    id: "art-1",
    title: "Test Article",
    description: "desc",
    link: "https://example.com",
    publishedAt: new Date("2026-03-20T10:00:00Z"),
    source: "test",
    language: "en",
    ...overrides,
  }
}

describe("fetchAndParseAllFeeds", () => {
  beforeEach(() => {
    mockConnectors.length = 0
    vi.clearAllMocks()
  })

  it("fetches and parses multiple feeds", async () => {
    const article1 = makeArticle({ id: "a1", title: "Article 1" })
    const article2 = makeArticle({ id: "a2", title: "Article 2" })

    mockConnectors.push(
      {
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article1]),
      },
      {
        id: "c2",
        name: "Connector 2",
        language: "en",
        feeds: [{ id: "f2", name: "Feed 2" }],
        parse: vi.fn(() => [article2]),
      },
    )

    mockFetchFeed.mockResolvedValue("<xml/>")

    const result = await fetchAndParseAllFeeds(["f1", "f2"])

    expect(result.articles).toHaveLength(2)
    expect(result.articles).toEqual(
      expect.arrayContaining([
        { ...article1, feedId: "f1" },
        { ...article2, feedId: "f2" },
      ]),
    )
    expect(result.errors).toHaveLength(0)
    expect(mockFetchFeed).toHaveBeenCalledWith("/api/rss/f1")
    expect(mockFetchFeed).toHaveBeenCalledWith("/api/rss/f2")
  })

  it("continues when individual feed fails", async () => {
    const article1 = makeArticle({ id: "a1", title: "Article 1" })

    mockConnectors.push(
      {
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article1]),
      },
      {
        id: "c2",
        name: "Connector 2",
        language: "en",
        feeds: [{ id: "f2", name: "Feed 2" }],
        parse: vi.fn(),
      },
    )

    mockFetchFeed
      .mockResolvedValueOnce("<xml/>")
      .mockRejectedValueOnce(new Error("Network error"))

    const result = await fetchAndParseAllFeeds(["f1", "f2"])

    expect(result.articles).toHaveLength(1)
    expect(result.articles[0].id).toBe("a1")
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain("Network error")
  })

  it("returns empty array when all feeds fail", async () => {
    mockConnectors.push(
      {
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(),
      },
      {
        id: "c2",
        name: "Connector 2",
        language: "en",
        feeds: [{ id: "f2", name: "Feed 2" }],
        parse: vi.fn(),
      },
    )

    mockFetchFeed
      .mockRejectedValueOnce(new Error("Timeout"))
      .mockRejectedValueOnce(new Error("DNS error"))

    const result = await fetchAndParseAllFeeds(["f1", "f2"])

    expect(result.articles).toHaveLength(0)
    expect(result.errors).toHaveLength(2)
  })

  it("only fetches feeds matching provided IDs", async () => {
    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [
        { id: "f1", name: "Feed 1" },
        { id: "f2", name: "Feed 2" },
      ],
      parse: vi.fn(() => []),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    await fetchAndParseAllFeeds(["f1"])

    expect(mockFetchFeed).toHaveBeenCalledTimes(1)
    expect(mockFetchFeed).toHaveBeenCalledWith("/api/rss/f1")
  })

  it("has no React or DOM imports in module", async () => {
    const pipelineModule = await import("./feed-pipeline")
    expect(pipelineModule.fetchAndParseAllFeeds).toBeTypeOf("function")
  })
})
