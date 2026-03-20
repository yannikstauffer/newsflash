import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearFeedCache, useFeedData } from "./use-feed-data"

import type { NormalizedArticle } from "@/features/connectors/types"

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
  feeds: Array<{ id: string; name: string; proxyPath: string }>
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

const selectiveFeedEnabled = (feedId: string) => feedId === "f1"

describe("useFeedData", () => {
  const isFeedEnabled = vi.fn(() => true)

  beforeEach(() => {
    clearFeedCache()
    mockConnectors.length = 0
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearFeedCache()
  })

  it("fetches and merges articles from multiple feeds using Promise.all", async () => {
    const article1 = makeArticle({ id: "a1", title: "Article 1" })
    const article2 = makeArticle({
      id: "a2",
      title: "Article 2",
      publishedAt: new Date("2026-03-20T09:00:00Z"),
    })

    mockConnectors.push(
      {
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" }],
        parse: vi.fn(() => [article1]),
      },
      {
        id: "c2",
        name: "Connector 2",
        language: "en",
        feeds: [{ id: "f2", name: "Feed 2", proxyPath: "/proxy/f2" }],
        parse: vi.fn(() => [article2]),
      },
    )

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))

    await act(async () => {
      // Wait for the initial fetch triggered by useEffect
    })

    expect(result.current.articles).toHaveLength(2)
    expect(result.current.articles[0].id).toBe("a1")
    expect(result.current.articles[1].id).toBe("a2")
    expect(result.current.errors).toHaveLength(0)
  })

  it("collects errors from failed feeds without losing successful results", async () => {
    const article1 = makeArticle({ id: "a1", title: "Article 1" })

    mockConnectors.push(
      {
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" }],
        parse: vi.fn(() => [article1]),
      },
      {
        id: "c2",
        name: "Connector 2",
        language: "en",
        feeds: [{ id: "f2", name: "Feed 2", proxyPath: "/proxy/f2" }],
        parse: vi.fn(),
      },
    )

    mockFetchFeed
      .mockResolvedValueOnce("<xml/>")
      .mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useFeedData(isFeedEnabled))

    await act(async () => {})

    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].id).toBe("a1")
    expect(result.current.errors).toHaveLength(1)
    expect(result.current.errors[0]).toContain("Network error")
  })

  it("skips fetch when cache is populated", async () => {
    const article1 = makeArticle({ id: "a1", title: "Cached Article" })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" }],
      parse: vi.fn(() => [article1]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    // First render: populates cache
    const { result: firstResult, unmount } = renderHook(() =>
      useFeedData(isFeedEnabled),
    )

    await act(async () => {})

    expect(firstResult.current.articles).toHaveLength(1)
    expect(mockFetchFeed).toHaveBeenCalledTimes(1)

    unmount()

    // Second render: should use cache, no fetch
    const { result: secondResult } = renderHook(() =>
      useFeedData(isFeedEnabled),
    )

    expect(secondResult.current.articles).toHaveLength(1)
    expect(secondResult.current.articles[0].id).toBe("a1")
    expect(mockFetchFeed).toHaveBeenCalledTimes(1) // Still 1, no new fetch
  })

  it("fetches when cache is cleared", async () => {
    const article1 = makeArticle({ id: "a1", title: "Article" })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" }],
      parse: vi.fn(() => [article1]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    // First render: populates cache
    const { unmount } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})
    expect(mockFetchFeed).toHaveBeenCalledTimes(1)
    unmount()

    // Clear cache
    clearFeedCache()

    // Second render: should fetch again
    renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})
    expect(mockFetchFeed).toHaveBeenCalledTimes(2)
  })

  it("sets lastRefreshedAt after successful fetch", async () => {
    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" }],
      parse: vi.fn(() => []),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))

    expect(result.current.lastRefreshedAt).toBeNull()

    await act(async () => {})

    expect(result.current.lastRefreshedAt).toBeInstanceOf(Date)
  })

  it("updates lastRefreshedAt on manual refresh", async () => {
    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" }],
      parse: vi.fn(() => []),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    const firstTimestamp = result.current.lastRefreshedAt

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.lastRefreshedAt).not.toBe(firstTimestamp)
  })

  it("deduplicates articles with same title and publishedAt", async () => {
    const publishedAt = new Date("2026-03-20T10:00:00Z")
    const article = makeArticle({ id: "a1", title: "Dup", publishedAt })
    const duplicate = makeArticle({ id: "a2", title: "Dup", publishedAt })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" }],
      parse: vi.fn(() => [article, duplicate]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(1)
  })

  it("skips disabled feeds", async () => {
    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [
        { id: "f1", name: "Feed 1", proxyPath: "/proxy/f1" },
        { id: "f2", name: "Feed 2", proxyPath: "/proxy/f2" },
      ],
      parse: vi.fn(() => []),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(selectiveFeedEnabled))
    await act(async () => {})

    expect(mockFetchFeed).toHaveBeenCalledTimes(1)
    expect(mockFetchFeed).toHaveBeenCalledWith("/proxy/f1")
    expect(result.current.loading).toBe(false)
  })
})
