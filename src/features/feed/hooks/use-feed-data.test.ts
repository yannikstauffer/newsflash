import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearFeedCache, hasArticleListChanged, useFeedData } from "./use-feed-data"

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
  evict: vi.fn().mockResolvedValue(undefined),
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
const partialFeedEnabled = (feedId: string) => feedId !== "f3"

describe("useFeedData", () => {
  const isFeedEnabled = vi.fn(() => true)

  beforeEach(() => {
    clearFeedCache()
    localStorage.clear()
    mockConnectors.length = 0
    vi.clearAllMocks()
    mockGetAll.mockResolvedValue([])
    mockUpsertMany.mockResolvedValue(undefined)
  })

  afterEach(() => {
    clearFeedCache()
    localStorage.clear()
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
      const cachedArticle = makeArticle({ id: "cached-1", title: "From IDB", source: "c1" })
      const networkArticle = makeArticle({
        id: "net-1",
        title: "From Network",
        source: "c1",
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
      const cachedArticle = makeArticle({ id: "cached-1", title: "Old Article", source: "c1" })
      const freshArticle = makeArticle({
        id: "fresh-1",
        title: "Fresh Article",
        source: "c1",
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
      const networkArticle = makeArticle({ id: "net-1", title: "Network Article", feedId: "f1" })

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

    it("excludes cached articles from sources with disabled feeds", async () => {
      const cachedFromEnabled = makeArticle({ id: "c1-1", title: "Enabled Source", source: "c1" })
      const cachedFromDisabled = makeArticle({ id: "c2-1", title: "Disabled Source", source: "c2" })

      mockGetAll.mockResolvedValue([cachedFromEnabled, cachedFromDisabled])

      mockConnectors.push(
        {
          id: "c1",
          name: "Connector 1",
          language: "en",
          feeds: [{ id: "f1", name: "Feed 1" }],
          parse: vi.fn(() => []),
        },
        {
          id: "c2",
          name: "Connector 2",
          language: "en",
          feeds: [{ id: "f2", name: "Feed 2" }, { id: "f3", name: "Feed 3" }],
          parse: vi.fn(() => []),
        },
      )

      // f3 is disabled, so c2 is not fully enabled
      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(partialFeedEnabled))

      await act(async () => {})

      // Only articles from fully-enabled source c1 should appear
      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].source).toBe("c1")
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
      const networkArticle = makeArticle({ id: "net-1", title: "Refreshed Article", feedId: "f1" })

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

  describe("offline error suppression", () => {
    it("suppresses errors when IDB cache has articles", async () => {
      const cachedArticle = makeArticle({ id: "cached-1", title: "Cached", source: "c1" })

      mockGetAll.mockResolvedValue([cachedArticle])

      mockConnectors.push(
        {
          id: "c1",
          name: "Connector 1",
          language: "en",
          feeds: [{ id: "f1", name: "Feed 1" }],
          parse: vi.fn(() => []),
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
      expect(result.current.errors).toHaveLength(0)
    })

    it("does not update lastRefreshedAt when fetch fails and errors are suppressed", async () => {
      const cachedArticle = makeArticle({ id: "cached-1", title: "Cached", source: "c1" })

      mockGetAll.mockResolvedValue([cachedArticle])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(),
      })

      mockFetchFeed.mockRejectedValueOnce(new Error("Network error"))

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      expect(result.current.errors).toHaveLength(0)
      expect(result.current.lastRefreshedAt).toBeNull()
    })

    it("surfaces errors when IDB cache is empty", async () => {
      mockGetAll.mockResolvedValue([])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(),
      })

      mockFetchFeed.mockRejectedValueOnce(new Error("Network error"))

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      expect(result.current.errors).toHaveLength(1)
      expect(result.current.errors[0]).toContain("Network error")
    })

    it("logs suppressed errors to console.error", async () => {
      const cachedArticle = makeArticle({ id: "cached-1", title: "Cached", source: "c1" })
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      mockGetAll.mockResolvedValue([cachedArticle])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(),
      })

      mockFetchFeed.mockRejectedValueOnce(new Error("Network error"))

      renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      expect(consoleSpy).toHaveBeenCalledWith(
        "[feed] suppressed fetch error (cached data available):",
        expect.stringContaining("Network error"),
      )

      consoleSpy.mockRestore()
    })
  })

  describe("ensureProcessed fixup", () => {
    it("fixes up unprocessed articles from IDB before rendering", async () => {
      const unprocessedArticle = makeArticle({
        id: "unproc-1",
        title: "Unprocessed",
        description: '<img src="https://example.com/photo.jpg"><p>Raw HTML desc</p>',
        source: "c1",
        processed: false,
      })

      mockGetAll.mockResolvedValue([unprocessedArticle])

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

      const article = result.current.articles.find((a) => a.id === "unproc-1")
      expect(article).toBeDefined()
      expect(article!.description).toBe("Raw HTML desc")
      expect(article!.imageUrl).toBe("https://example.com/photo.jpg")
      expect(article!.processed).toBe(true)
    })

    it("stamps legacy articles (missing processed flag) as processed without re-processing", async () => {
      // Legacy description contains literal `<...>` text (e.g., from a
      // decoded `&lt;b&gt;`). Re-running stripHtml would corrupt it by
      // treating `<b>` as a tag.
      const legacyArticle = makeArticle({
        id: "legacy-1",
        title: "Legacy",
        description: "Use <b> to bold text",
        imageUrl: "https://example.com/existing.jpg",
        source: "c1",
        // processed: undefined — simulates pre-PR cached entries
      })

      mockGetAll.mockResolvedValue([legacyArticle])

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

      const article = result.current.articles.find((a) => a.id === "legacy-1")
      expect(article).toBeDefined()
      expect(article!.processed).toBe(true)
      // Description preserved verbatim — no re-processing
      expect(article!.description).toBe("Use <b> to bold text")
      expect(article!.imageUrl).toBe("https://example.com/existing.jpg")
    })

    it("passes through already-processed articles unchanged", async () => {
      const processedArticle = makeArticle({
        id: "proc-1",
        title: "Processed",
        description: "Clean text",
        imageUrl: "https://example.com/existing.jpg",
        source: "c1",
        processed: true,
      })

      mockGetAll.mockResolvedValue([processedArticle])

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

      const article = result.current.articles.find((a) => a.id === "proc-1")
      expect(article).toBeDefined()
      expect(article!.description).toBe("Clean text")
      expect(article!.imageUrl).toBe("https://example.com/existing.jpg")
    })

    it("preserves existing imageUrl on unprocessed articles", async () => {
      const unprocessedWithImage = makeArticle({
        id: "unproc-2",
        title: "Has Image",
        description: "<p>Some HTML</p>",
        imageUrl: "https://example.com/xml-image.jpg",
        source: "c1",
        processed: false,
      })

      mockGetAll.mockResolvedValue([unprocessedWithImage])

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

      const article = result.current.articles.find((a) => a.id === "unproc-2")
      expect(article).toBeDefined()
      expect(article!.imageUrl).toBe("https://example.com/xml-image.jpg")
      expect(article!.description).toBe("Some HTML")
      expect(article!.processed).toBe(true)
    })

    it("does not write back to IDB after fixup", async () => {
      const unprocessedArticle = makeArticle({
        id: "unproc-3",
        title: "No Writeback",
        description: "<p>HTML</p>",
        source: "c1",
        processed: false,
      })

      mockGetAll.mockResolvedValue([unprocessedArticle])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => []),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      // upsertMany should not be called for fixup (only for network results)
      // network returned 0 articles, so upsertMany should not be called at all
      expect(mockUpsertMany).not.toHaveBeenCalled()
    })
  })

  describe("historical day navigation", () => {
    it("includes cached articles from IDB when not in network fetch results", async () => {
      const oldCachedArticle = makeArticle({
        id: "old-1",
        title: "Old Cached Article",
        source: "c1",
        link: "https://example.com/old",
        publishedAt: new Date("2026-03-15T10:00:00Z"),
      })
      const freshArticle = makeArticle({
        id: "fresh-1",
        title: "Fresh Article",
        source: "c1",
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

  describe("lastRefreshedAt localStorage persistence", () => {
    it("hydrates lastRefreshedAt from localStorage when feedCache is empty", () => {
      const iso = "2026-04-09T10:00:00.000Z"
      localStorage.setItem("newsflash:last-refreshed-at", iso)

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => []),
      })
      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))

      expect(result.current.lastRefreshedAt).toEqual(new Date(iso))
    })

    it("returns null when localStorage has no persisted value", () => {
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
    })

    it("persists lastRefreshedAt to localStorage after successful fetch", async () => {
      const article = makeArticle()
      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article]),
      })
      mockFetchFeed.mockResolvedValue("<xml/>")

      renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      const stored = localStorage.getItem("newsflash:last-refreshed-at")
      expect(stored).not.toBeNull()
      expect(new Date(stored!)).toBeInstanceOf(Date)
    })
  })

  describe("pending articles buffer", () => {
    it("subsequent background refresh defers new articles", async () => {
      const existing = makeArticle({
        id: "a1",
        title: "Existing",
        link: "https://example.com/a1",
        source: "c1",
      })
      const fresh = makeArticle({
        id: "net-1",
        title: "Fresh",
        link: "https://example.com/fresh",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
        source: "c1",
      })

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [existing]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      expect(result.current.articles).toHaveLength(1)
      expect(result.current.pendingCount).toBe(0)

      mockConnectors[0].parse = vi.fn(() => [existing, fresh])

      await act(async () => {
        await result.current.refresh({ forceUpdate: false })
      })

      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].id).toBe("a1")
      expect(result.current.pendingCount).toBe(1)
    })

    it("acceptPending merges pending articles into displayed and clears the buffer", async () => {
      const existing = makeArticle({
        id: "a1",
        title: "Existing",
        link: "https://example.com/a1",
        source: "c1",
      })
      const fresh = makeArticle({
        id: "net-1",
        title: "Fresh",
        link: "https://example.com/fresh",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
        source: "c1",
      })

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [existing]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      mockConnectors[0].parse = vi.fn(() => [existing, fresh])

      await act(async () => {
        await result.current.refresh({ forceUpdate: false })
      })

      expect(result.current.pendingCount).toBe(1)

      act(() => {
        result.current.acceptPending()
      })

      expect(result.current.pendingCount).toBe(0)
      expect(result.current.articles).toHaveLength(2)
      expect(result.current.articles.some((a) => a.id === "net-1")).toBe(true)
    })

    it("manual refresh (forceUpdate) bypasses the buffer and clears pending", async () => {
      const existing = makeArticle({
        id: "a1",
        title: "Existing",
        link: "https://example.com/a1",
        source: "c1",
      })
      const fresh = makeArticle({
        id: "net-1",
        title: "Fresh",
        link: "https://example.com/fresh",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
        source: "c1",
      })

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [existing]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      mockConnectors[0].parse = vi.fn(() => [existing, fresh])

      await act(async () => {
        await result.current.refresh({ forceUpdate: false })
      })

      expect(result.current.pendingCount).toBe(1)

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.pendingCount).toBe(0)
      expect(result.current.articles).toHaveLength(2)
    })

    it("initial load with empty displayed list populates articles directly", async () => {
      const fresh = makeArticle({ id: "net-1", title: "Fresh" })

      mockGetAll.mockResolvedValue([])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [fresh]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      expect(result.current.articles).toHaveLength(1)
      expect(result.current.articles[0].id).toBe("net-1")
      expect(result.current.pendingCount).toBe(0)
    })

    it("initial cache-to-network transition merges directly without deferring", async () => {
      const cached = makeArticle({
        id: "c1",
        title: "Cached",
        link: "https://example.com/c",
        source: "c1",
      })
      const fresh = makeArticle({
        id: "net-1",
        title: "Fresh",
        link: "https://example.com/fresh",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
        source: "c1",
      })

      mockGetAll.mockResolvedValue([cached])

      mockConnectors.push({
        id: "c1",
        name: "Connector 1",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [cached, fresh]),
      })

      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      expect(result.current.articles).toHaveLength(2)
      expect(result.current.pendingCount).toBe(0)
    })
  })

  describe("referential stability", () => {
    it("preserves article reference when background refresh returns identical IDs", async () => {
      const article1 = makeArticle({
        id: "a1",
        title: "Article 1",
        link: "https://example.com/1",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
        source: "test",
      })
      const article2 = makeArticle({
        id: "a2",
        title: "Article 2",
        link: "https://example.com/2",
        publishedAt: new Date("2026-03-20T10:00:00Z"),
        source: "test",
      })

      // Seed cache so initial hydration populates articles
      mockGetAll.mockResolvedValue([article1, article2])
      mockConnectors.push({
        id: "test",
        name: "Test",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article1, article2]),
      })
      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      const firstArticles = result.current.articles

      // The useEffect background fetch returned the same IDs — ref should be preserved
      expect(result.current.articles).toBe(firstArticles)
      expect(result.current.articles.length).toBeGreaterThan(0)
    })

    it("manual refresh always updates state even when IDs are identical", async () => {
      const article1 = makeArticle({
        id: "a1",
        title: "Article 1",
        link: "https://example.com/1",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
      })
      mockConnectors.push({
        id: "test",
        name: "Test",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article1]),
      })
      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      const firstArticles = result.current.articles

      // Manual refresh with identical articles — should still update (new ref)
      mockConnectors[0].parse = vi.fn(() => [article1])
      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.articles).not.toBe(firstArticles)
    })

    it("updates articles state when refresh returns new articles", async () => {
      const article1 = makeArticle({
        id: "a1",
        title: "Article 1",
        link: "https://example.com/1",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
      })
      mockConnectors.push({
        id: "test",
        name: "Test",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article1]),
      })
      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      const firstArticles = result.current.articles

      // Refresh returns an additional article
      const article2 = makeArticle({
        id: "a2",
        title: "Article 2",
        link: "https://example.com/2",
        publishedAt: new Date("2026-03-20T10:00:00Z"),
      })
      mockConnectors[0].parse = vi.fn(() => [article1, article2])
      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.articles).not.toBe(firstArticles)
      expect(result.current.articles).toHaveLength(2)
    })

    it("updates articles state when refresh returns reordered articles", async () => {
      const article1 = makeArticle({
        id: "a1",
        title: "Article 1",
        link: "https://example.com/1",
        publishedAt: new Date("2026-03-20T12:00:00Z"),
      })
      const article2 = makeArticle({
        id: "a2",
        title: "Article 2",
        link: "https://example.com/2",
        publishedAt: new Date("2026-03-20T10:00:00Z"),
      })
      mockConnectors.push({
        id: "test",
        name: "Test",
        language: "en",
        feeds: [{ id: "f1", name: "Feed 1" }],
        parse: vi.fn(() => [article1, article2]),
      })
      mockFetchFeed.mockResolvedValue("<xml/>")

      const { result } = renderHook(() => useFeedData(isFeedEnabled))
      await act(async () => {})

      const firstArticles = result.current.articles

      // Refresh returns same articles but with swapped timestamps (different order)
      const reorderedArticle1 = makeArticle({
        id: "a1",
        title: "Article 1",
        link: "https://example.com/1",
        publishedAt: new Date("2026-03-20T08:00:00Z"),
      })
      const reorderedArticle2 = makeArticle({
        id: "a2",
        title: "Article 2",
        link: "https://example.com/2",
        publishedAt: new Date("2026-03-20T14:00:00Z"),
      })
      mockConnectors[0].parse = vi.fn(() => [reorderedArticle1, reorderedArticle2])
      await act(async () => {
        await result.current.refresh()
      })

      // Order changed: a2 now comes before a1 due to timestamp
      expect(result.current.articles).not.toBe(firstArticles)
    })
  })
})

describe("hasArticleListChanged", () => {
  it("returns false for identical ID sequences", () => {
    const a = [makeArticle({ id: "1" }), makeArticle({ id: "2" })]
    const b = [makeArticle({ id: "1" }), makeArticle({ id: "2" })]
    expect(hasArticleListChanged(a, b)).toBe(false)
  })

  it("returns true for different lengths", () => {
    const a = [makeArticle({ id: "1" })]
    const b = [makeArticle({ id: "1" }), makeArticle({ id: "2" })]
    expect(hasArticleListChanged(a, b)).toBe(true)
  })

  it("returns true for different IDs", () => {
    const a = [makeArticle({ id: "1" }), makeArticle({ id: "2" })]
    const b = [makeArticle({ id: "1" }), makeArticle({ id: "3" })]
    expect(hasArticleListChanged(a, b)).toBe(true)
  })

  it("returns true for reordered IDs", () => {
    const a = [makeArticle({ id: "1" }), makeArticle({ id: "2" })]
    const b = [makeArticle({ id: "2" }), makeArticle({ id: "1" })]
    expect(hasArticleListChanged(a, b)).toBe(true)
  })

  it("returns false for two empty arrays", () => {
    expect(hasArticleListChanged([], [])).toBe(false)
  })
})
