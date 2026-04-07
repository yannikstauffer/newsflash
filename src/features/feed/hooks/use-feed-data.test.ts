import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearFeedCache, useFeedData } from "./use-feed-data"

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

vi.mock("@/lib/article-cache", () => ({
  getAll: vi.fn().mockResolvedValue([]),
  upsertMany: vi.fn().mockResolvedValue(undefined),
}))

import { fetchFeed } from "@/features/connectors/fetch-feed"
import { connectors } from "@/features/connectors/registry"
import * as articleCache from "@/lib/article-cache"

const mockFetchFeed = vi.mocked(fetchFeed)
const mockConnectors = connectors as unknown as Array<{
  id: string
  name: string
  language: "en"
  feeds: Array<{ id: string; name: string }>
  parse: ReturnType<typeof vi.fn>
}>
const mockGetAll = vi.mocked(articleCache.getAll)
const mockUpsertMany = vi.mocked(articleCache.upsertMany)

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
    mockGetAll.mockResolvedValue([])
    mockUpsertMany.mockResolvedValue(undefined)
  })

  afterEach(() => {
    clearFeedCache()
  })

  it("fetches and merges articles from multiple feeds using Promise.all", async () => {
    const article1 = makeArticle({ id: "a1", title: "Article 1", link: "https://example.com/1" })
    const article2 = makeArticle({
      id: "a2",
      title: "Article 2",
      link: "https://example.com/2",
      publishedAt: new Date("2026-03-20T09:00:00Z"),
    })

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

    const { result } = renderHook(() => useFeedData(isFeedEnabled))

    await act(async () => {})

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

    const { result } = renderHook(() => useFeedData(isFeedEnabled))

    await act(async () => {})

    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].id).toBe("a1")
    expect(result.current.errors).toHaveLength(1)
    expect(result.current.errors[0]).toContain("Network error")
  })

  it("skips fetch when L1 cache is populated", async () => {
    const article1 = makeArticle({ id: "a1", title: "Cached Article" })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
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

    // Second render: should use L1 cache, no fetch, no IDB read
    const { result: secondResult } = renderHook(() =>
      useFeedData(isFeedEnabled),
    )

    expect(secondResult.current.articles).toHaveLength(1)
    expect(secondResult.current.articles[0].id).toBe("a1")
    expect(mockFetchFeed).toHaveBeenCalledTimes(1) // Still 1, no new fetch
    // getAll should only have been called once (first render), not for the second render
    expect(mockGetAll).toHaveBeenCalledTimes(1)
  })

  it("fetches when cache is cleared", async () => {
    const article1 = makeArticle({ id: "a1", title: "Article" })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
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
      feeds: [{ id: "f1", name: "Feed 1" }],
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
      feeds: [{ id: "f1", name: "Feed 1" }],
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
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => [article, duplicate]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(1)
  })

  it("keeps articles with same title but different timestamps and different URLs", async () => {
    const article1 = makeArticle({
      id: "a1",
      title: "Same Title",
      link: "https://example.com/1",
      publishedAt: new Date("2026-03-20T10:00:00Z"),
    })
    const article2 = makeArticle({
      id: "a2",
      title: "Same Title",
      link: "https://example.com/2",
      publishedAt: new Date("2026-03-20T11:00:00Z"),
    })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => [article1, article2]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(2)
  })

  it("sorts articles in reverse chronological order (newest first)", async () => {
    const oldest = makeArticle({
      id: "a1",
      title: "Oldest",
      link: "https://example.com/oldest",
      publishedAt: new Date("2026-03-18T10:00:00Z"),
    })
    const middle = makeArticle({
      id: "a2",
      title: "Middle",
      link: "https://example.com/middle",
      publishedAt: new Date("2026-03-19T10:00:00Z"),
    })
    const newest = makeArticle({
      id: "a3",
      title: "Newest",
      link: "https://example.com/newest",
      publishedAt: new Date("2026-03-20T10:00:00Z"),
    })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => [oldest, middle, newest]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles[0].title).toBe("Newest")
    expect(result.current.articles[1].title).toBe("Middle")
    expect(result.current.articles[2].title).toBe("Oldest")
  })

  it("returns errors for all feeds when all feeds fail", async () => {
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

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(0)
    expect(result.current.errors).toHaveLength(2)
    expect(result.current.errors[0]).toContain("Timeout")
    expect(result.current.errors[1]).toContain("DNS error")
  })

  it("sets loading to true during fetch and false after completion", async () => {
    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => []),
    })

    let resolveFetch: (value: string) => void
    const fetchPromise = new Promise<void>((resolveOuter) => {
      mockFetchFeed.mockImplementation(
        () =>
          new Promise<string>((resolve) => {
            resolveFetch = resolve
            resolveOuter()
          }),
      )
    })

    const { result } = renderHook(() => useFeedData(isFeedEnabled))

    // Loading should be true while fetch is in progress
    expect(result.current.loading).toBe(true)

    // Wait for fetchFeed to actually be called
    await act(async () => {
      await fetchPromise
    })

    await act(async () => {
      resolveFetch!("<xml/>")
    })

    // Loading should be false after fetch completes
    expect(result.current.loading).toBe(false)
  })

  it("deduplicates articles with same URL but different titles", async () => {
    const article1 = makeArticle({
      id: "a1",
      title: "Title A",
      link: "https://example.com/article",
      publishedAt: new Date("2026-03-20T11:00:00Z"),
    })
    const article2 = makeArticle({
      id: "a2",
      title: "Title B",
      link: "https://example.com/article",
      publishedAt: new Date("2026-03-20T10:00:00Z"),
    })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => [article1, article2]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(1)
  })

  it("keeps the youngest article when duplicates share the same URL", async () => {
    const older = makeArticle({
      id: "a1",
      title: "Older Version",
      link: "https://example.com/article",
      publishedAt: new Date("2026-03-20T10:00:00Z"),
    })
    const newer = makeArticle({
      id: "a2",
      title: "Newer Version",
      link: "https://example.com/article",
      publishedAt: new Date("2026-03-20T11:00:00Z"),
    })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => [older, newer]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].title).toBe("Newer Version")
  })

  it("deduplicates articles with different URLs but same title and date", async () => {
    const publishedAt = new Date("2026-03-20T10:00:00Z")
    const article1 = makeArticle({
      id: "a1",
      title: "Same Title",
      link: "https://example.com/article-1",
      publishedAt,
    })
    const article2 = makeArticle({
      id: "a2",
      title: "Same Title",
      link: "https://example.com/article-2",
      publishedAt,
    })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => [article1, article2]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(1)
  })

  it("keeps articles with different URLs and different title+date", async () => {
    const article1 = makeArticle({
      id: "a1",
      title: "Article One",
      link: "https://example.com/article-1",
      publishedAt: new Date("2026-03-20T10:00:00Z"),
    })
    const article2 = makeArticle({
      id: "a2",
      title: "Article Two",
      link: "https://example.com/article-2",
      publishedAt: new Date("2026-03-20T11:00:00Z"),
    })

    mockConnectors.push({
      id: "c1",
      name: "Connector 1",
      language: "en",
      feeds: [{ id: "f1", name: "Feed 1" }],
      parse: vi.fn(() => [article1, article2]),
    })

    mockFetchFeed.mockResolvedValue("<xml/>")

    const { result } = renderHook(() => useFeedData(isFeedEnabled))
    await act(async () => {})

    expect(result.current.articles).toHaveLength(2)
  })

  it("skips disabled feeds", async () => {
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

    const { result } = renderHook(() => useFeedData(selectiveFeedEnabled))
    await act(async () => {})

    expect(mockFetchFeed).toHaveBeenCalledTimes(1)
    expect(mockFetchFeed).toHaveBeenCalledWith("/api/rss/f1")
    expect(result.current.loading).toBe(false)
  })

  describe("L2 (IndexedDB) cache", () => {
    it("shows cached articles from IDB immediately without spinner when L1 is empty", async () => {
      const cachedArticle = makeArticle({ id: "cached-1", title: "From IDB" })
      const networkArticle = makeArticle({
        id: "net-1",
        title: "From Network",
        link: "https://example.com/net",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
      })

      mockGetAll.mockResolvedValue([cachedArticle])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [networkArticle]),
      })

      let resolveFetch: (value: string) => void
      const fetchCalled = new Promise<void>((resolveOuter) => {
        mockFetchFeed.mockImplementation(
          () =>
            new Promise<string>((resolve) => {
              resolveFetch = resolve
              resolveOuter()
            }),
        )
      })

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      // Wait for IDB read to complete
      await act(async () => {})

      // After IDB read, should show cached articles and not be loading
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].id).toBe("cached-1")
      expect(result.current.loading).toBe(false)

      // Wait for fetchFeed to actually be called before resolving
      await act(async () => {
        await fetchCalled
      })

      // Resolve network fetch
      await act(async () => {
        resolveFetch!("<xml/>")
      })

      // After network fetch, should show merged articles
      expect(result.current.articles).toHaveLength(2)
    })

    it("shows spinner when both L1 and L2 are empty", async () => {
      mockGetAll.mockResolvedValue([])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => []),
      })

      let resolveFetch: (value: string) => void
      const fetchPromise = new Promise<void>((resolveOuter) => {
        mockFetchFeed.mockImplementation(
          () =>
            new Promise<string>((resolve) => {
              resolveFetch = resolve
              resolveOuter()
            }),
        )
      })

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      // Loading should remain true since IDB is empty
      expect(result.current.loading).toBe(true)

      // Wait for fetchFeed to actually be called
      await act(async () => {
        await fetchPromise
      })

      await act(async () => {
        resolveFetch!("<xml/>")
      })

      expect(result.current.loading).toBe(false)
    })

    it("background fetch updates articles after L2 hit", async () => {
      const cachedArticle = makeArticle({ id: "cached-1", title: "Old Article" })
      const freshArticle = makeArticle({
        id: "fresh-1",
        title: "Fresh Article",
        link: "https://example.com/fresh",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
      })

      mockGetAll.mockResolvedValue([cachedArticle])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [freshArticle]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      await act(async () => {})

      // After both IDB and network complete, should have merged articles
      expect(result.current.articles).toHaveLength(2)
      expect(result.current.articles[0].title).toBe("Fresh Article")
      expect(result.current.articles[1].title).toBe("Old Article")
    })

    it("upserts network results into IDB after fetch", async () => {
      const networkArticle = makeArticle({ id: "net-1", title: "Network Article" })

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [networkArticle]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      renderHook(() => useFeedData(isFeedEnabled))

      await act(async () => {})

      expect(mockUpsertMany).toHaveBeenCalledWith([networkArticle])
    })

    it("falls back to network-only when IDB read fails", async () => {
      mockGetAll.mockRejectedValue(new Error("IDB unavailable"))

      const networkArticle = makeArticle({ id: "net-1", title: "Network Article" })

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [networkArticle]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      await act(async () => {})

      // Should still show network articles despite IDB failure
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].id).toBe("net-1")
      expect(result.current.loading).toBe(false)
    })

    it("revalidates on remount when L1 was populated from L2 without network completion", async () => {
      const cachedArticle = makeArticle({ id: "cached-1", title: "From IDB" })

      mockGetAll.mockResolvedValue([cachedArticle])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [cachedArticle]),
      })

      // Network fetch that never resolves (simulates unmount before completion)
      mockFetchFeed.mockImplementation(() => new Promise<string>(() => {}))

      const { unmount } = renderHook(() => useFeedData(isFeedEnabled))

      // Wait for IDB read to populate L1
      await act(async () => {})

      unmount()

      // Now network fetch resolves on remount
      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result: secondResult } = renderHook(() => useFeedData(isFeedEnabled))

      // Should still trigger a background fetch since lastRefreshedAt is null
      await act(async () => {})

      expect(secondResult.current.articles).toHaveLength(1)
      // Verify network fetch was triggered (not skipped by shouldSkipInitialFetch)
      expect(mockFetchFeed).toHaveBeenCalled()
    })
  })

  describe("refresh with IDB", () => {
    it("upserts into IDB on manual refresh", async () => {
      const networkArticle = makeArticle({ id: "net-1", title: "Refreshed Article" })

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [networkArticle]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      await act(async () => {})

      mockUpsertMany.mockClear()

      await act(async () => {
        await result.current.refresh()
      })

      expect(mockUpsertMany).toHaveBeenCalledWith([networkArticle])
    })

    it("continues refresh when IDB upsert fails", async () => {
      mockUpsertMany.mockRejectedValue(new Error("IDB write failed"))

      const networkArticle = makeArticle({ id: "net-1", title: "Article" })

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [networkArticle]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      await act(async () => {})

      // Should still show articles despite IDB write failure
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.loading).toBe(false)
    })
  })

  describe("historical day navigation", () => {
    it("includes cached articles from IDB when not in network fetch results", async () => {
      const oldCachedArticle = makeArticle({
        id: "old-1",
        title: "Old Cached Article",
        link: "https://example.com/old",
        publishedAt: new Date("2026-03-15T10:00:00Z"),
      })
      const freshArticle = makeArticle({
        id: "fresh-1",
        title: "Fresh Article",
        link: "https://example.com/fresh",
        publishedAt: new Date("2026-03-20T10:00:00Z"),
      })

      mockGetAll.mockResolvedValue([oldCachedArticle])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [freshArticle]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      await act(async () => {})

      // Both fresh and cached articles should be in the result
      expect(result.current.articles).toHaveLength(2)
      expect(result.current.articles.some((a) => a.id === "old-1")).toBe(true)
      expect(result.current.articles.some((a) => a.id === "fresh-1")).toBe(true)
    })

    it("deduplicates when same article exists in both cache and network", async () => {
      const article = makeArticle({ id: "a1", title: "Same Article" })

      mockGetAll.mockResolvedValue([article])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      await act(async () => {})

      // Should be deduplicated to 1
      expect(result.current.articles).toHaveLength(1)
    })
  })
})
