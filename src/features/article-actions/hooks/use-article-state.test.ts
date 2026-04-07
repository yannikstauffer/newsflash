import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  MAX_HIDDEN_IDS,
  MAX_READLIST_ITEMS,
  useArticleState,
} from "./use-article-state"

import type { NormalizedArticle } from "@/features/connectors/types"

vi.mock("@/lib/article-cache", () => ({
  setPinned: vi.fn().mockResolvedValue(undefined),
  bulkSetPinned: vi.fn().mockResolvedValue(undefined),
  upsertMany: vi.fn().mockResolvedValue(undefined),
}))

import * as articleCache from "@/lib/article-cache"

const mockSetPinned = vi.mocked(articleCache.setPinned)
const mockBulkSetPinned = vi.mocked(articleCache.bulkSetPinned)
const mockUpsertMany = vi.mocked(articleCache.upsertMany)

const HIDDEN_KEY = "newsflash:hidden"
const READLIST_KEY = "newsflash:readlist"

function makeArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    id: "heise:abc123",
    title: "Test Article",
    description: "A test article",
    link: "https://example.com/article",
    publishedAt: new Date("2026-01-15T10:00:00Z"),
    source: "heise",
    language: "de",
    ...overrides,
  }
}

describe("useArticleState", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe("removeHiddenBySource", () => {
    it("removes hidden IDs matching the source prefix", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["heise:abc", "heise:def", "srf:ghi"]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.removeHiddenBySource("heise")
      })

      expect(result.current.hiddenIds).toEqual(["srf:ghi"])
    })

    it("does not remove IDs that do not match the source prefix", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["srf:abc", "engadget:def"]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.removeHiddenBySource("heise")
      })

      expect(result.current.hiddenIds).toEqual(["srf:abc", "engadget:def"])
    })

    it("handles empty hidden list", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.removeHiddenBySource("heise")
      })

      expect(result.current.hiddenIds).toEqual([])
    })
  })

  describe("pruning constants", () => {
    it("exports MAX_HIDDEN_IDS as 500", () => {
      expect(MAX_HIDDEN_IDS).toBe(500)
    })

    it("exports MAX_READLIST_ITEMS as 200", () => {
      expect(MAX_READLIST_ITEMS).toBe(200)
    })
  })

  describe("hideArticle pruning", () => {
    it("does not prune when list is under the limit", () => {
      const ids = Array.from({ length: 10 }, (_, index) => `src:id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("src:new-id")
      })

      expect(result.current.hiddenIds).toHaveLength(11)
      expect(result.current.hiddenIds[0]).toBe("src:new-id")
    })

    it("drops the oldest entry when hiding at exactly max capacity", () => {
      const ids = Array.from({ length: MAX_HIDDEN_IDS }, (_, index) => `src:id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("src:new-id")
      })

      expect(result.current.hiddenIds).toHaveLength(MAX_HIDDEN_IDS)
      expect(result.current.hiddenIds[0]).toBe("src:new-id")
      expect(result.current.hiddenIds).not.toContain(`src:id-${MAX_HIDDEN_IDS - 1}`)
    })

    it("truncates an oversized existing list to max on next write", () => {
      const ids = Array.from({ length: MAX_HIDDEN_IDS + 50 }, (_, index) => `src:id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("src:new-id")
      })

      expect(result.current.hiddenIds).toHaveLength(MAX_HIDDEN_IDS)
      expect(result.current.hiddenIds[0]).toBe("src:new-id")
    })

    it("does not change the list when hiding a duplicate ID", () => {
      const ids = Array.from({ length: MAX_HIDDEN_IDS }, (_, index) => `src:id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())
      const before = result.current.hiddenIds

      act(() => {
        result.current.hideArticle("src:id-0")
      })

      expect(result.current.hiddenIds).toBe(before)
    })
  })

  describe("addToReadList pruning", () => {
    it("does not prune when list is under the limit", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        for (let index = 0; index < 10; index++) {
          result.current.addToReadList(makeArticle({ id: `heise:art-${index}` }))
        }
      })

      expect(result.current.readListArticles).toHaveLength(10)
    })

    it("drops the oldest article when adding at exactly max capacity", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        for (let index = 0; index < MAX_READLIST_ITEMS; index++) {
          result.current.addToReadList(makeArticle({ id: `heise:art-${index}` }))
        }
      })

      expect(result.current.readListArticles).toHaveLength(MAX_READLIST_ITEMS)

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:new-art" }))
      })

      expect(result.current.readListArticles).toHaveLength(MAX_READLIST_ITEMS)
      expect(result.current.readListIds[0]).toBe("heise:new-art")
      expect(result.current.readListIds).not.toContain("heise:art-0")
    })

    it("truncates an oversized existing list to max on next write", () => {
      const stored = Array.from({ length: MAX_READLIST_ITEMS + 30 }, (_, index) => ({
        id: `heise:art-${index}`,
        title: "Title",
        description: "Desc",
        link: "https://example.com",
        publishedAt: "2026-01-15T10:00:00.000Z",
        source: "heise",
        language: "de",
      }))
      localStorage.setItem(READLIST_KEY, JSON.stringify(stored))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:new-art" }))
      })

      expect(result.current.readListArticles).toHaveLength(MAX_READLIST_ITEMS)
      expect(result.current.readListIds[0]).toBe("heise:new-art")
    })

    it("does not change the list when adding a duplicate article", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:art-1" }))
      })

      const before = result.current.readListArticles

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:art-1" }))
      })

      expect(result.current.readListArticles).toBe(before)
    })
  })

  describe("removeReadListBySource", () => {
    it("removes read list entries matching the source", () => {
      const heiseArticle = makeArticle({ id: "heise:h1", source: "heise" })
      const srfArticle = makeArticle({ id: "srf:s1", source: "srf" })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(heiseArticle)
        result.current.addToReadList(srfArticle)
      })

      expect(result.current.readListIds).toHaveLength(2)

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(result.current.readListIds).toEqual(["srf:s1"])
      expect(result.current.readListArticles).toHaveLength(1)
      expect(result.current.readListArticles[0].source).toBe("srf")
    })

    it("does not remove entries from other sources", () => {
      const srfArticle = makeArticle({ id: "srf:s1", source: "srf" })
      const engadgetArticle = makeArticle({ id: "engadget:e1", source: "engadget" })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(srfArticle)
        result.current.addToReadList(engadgetArticle)
      })

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(result.current.readListIds).toEqual(["engadget:e1", "srf:s1"])
    })

    it("handles empty read list", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(result.current.readListArticles).toEqual([])
    })

    it("persists cleanup to localStorage", () => {
      const heiseArticle = makeArticle({ id: "heise:h1", source: "heise" })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(heiseArticle)
      })

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      const stored = JSON.parse(localStorage.getItem(READLIST_KEY) ?? "[]")
      expect(stored).toEqual([])
    })
  })

  describe("Set-based lookups", () => {
    it("isHidden uses Set for O(1) lookup", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["heise:abc", "srf:def"]),
      )

      const { result } = renderHook(() => useArticleState())

      expect(result.current.isHidden("heise:abc")).toBe(true)
      expect(result.current.isHidden("srf:def")).toBe(true)
      expect(result.current.isHidden("unknown:xyz")).toBe(false)
    })

    it("isInReadList uses Set for O(1) lookup", () => {
      const article = makeArticle({ id: "heise:abc" })
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(article)
      })

      expect(result.current.isInReadList("heise:abc")).toBe(true)
      expect(result.current.isInReadList("unknown:xyz")).toBe(false)
    })
  })

  describe("unhideArticles", () => {
    it("removes multiple IDs from hiddenIds", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["heise:abc", "srf:def", "engadget:ghi"]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.unhideArticles(["heise:abc", "engadget:ghi"])
      })

      expect(result.current.hiddenIds).toEqual(["srf:def"])
    })

    it("is a no-op for IDs not in the hidden list", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["heise:abc", "srf:def"]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.unhideArticles(["unknown:xyz", "missing:123"])
      })

      expect(result.current.hiddenIds).toEqual(["heise:abc", "srf:def"])
    })
  })

  describe("clearReadList", () => {
    it("empties the read list completely", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:a1" }))
        result.current.addToReadList(makeArticle({ id: "heise:a2" }))
      })

      expect(result.current.readListArticles).toHaveLength(2)

      act(() => {
        result.current.clearReadList()
      })

      expect(result.current.readListArticles).toEqual([])
      expect(result.current.readListIds).toEqual([])
    })
  })

  describe("restoreReadList", () => {
    it("adds articles without duplicates", () => {
      const existing = makeArticle({ id: "heise:existing" })
      const newArticle = makeArticle({ id: "heise:new" })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(existing)
      })

      act(() => {
        result.current.restoreReadList([existing, newArticle])
      })

      expect(result.current.readListIds).toEqual(["heise:new", "heise:existing"])
    })

    it("caps at MAX_READLIST_ITEMS", () => {
      const articles = Array.from({ length: MAX_READLIST_ITEMS + 50 }, (_, index) =>
        makeArticle({ id: `heise:art-${index}` }),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.restoreReadList(articles)
      })

      expect(result.current.readListArticles).toHaveLength(MAX_READLIST_ITEMS)
    })
  })

  describe("readListIds and readListArticles derived memos", () => {
    it("readListIds reflects stored article IDs in order", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:a1" }))
        result.current.addToReadList(makeArticle({ id: "heise:a2" }))
      })

      expect(result.current.readListIds).toEqual(["heise:a2", "heise:a1"])
    })

    it("readListArticles deserializes with publishedAt as Date", () => {
      const article = makeArticle({
        id: "heise:a1",
        publishedAt: new Date("2026-03-20T10:00:00Z"),
      })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(article)
      })

      expect(result.current.readListArticles[0].publishedAt).toBeInstanceOf(Date)
      expect(result.current.readListArticles[0].id).toBe("heise:a1")
    })
  })

  describe("legacy data migration", () => {
    it("clears legacy hidden IDs without colon separator", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["abc123", "def456", "heise:valid"]),
      )

      const { result } = renderHook(() => useArticleState())

      // After migration effect runs
      expect(result.current.hiddenIds).toEqual(["heise:valid"])
    })

    it("clears legacy read list entries without colon separator in ID", () => {
      const stored = [
        {
          id: "legacy123",
          title: "Legacy",
          description: "Old",
          link: "https://example.com",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
        {
          id: "heise:valid456",
          title: "Valid",
          description: "New",
          link: "https://example.com/valid",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
      ]
      localStorage.setItem(READLIST_KEY, JSON.stringify(stored))

      const { result } = renderHook(() => useArticleState())

      expect(result.current.readListIds).toEqual(["heise:valid456"])
    })

    it("preserves all IDs when all have source prefix", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["heise:abc", "srf:def"]),
      )

      const { result } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).toEqual(["heise:abc", "srf:def"])
    })

    it("clears all IDs when none have source prefix", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["abc123", "def456"]),
      )

      const { result } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).toEqual([])
    })
  })

  describe("IDB cache pinning", () => {
    it("upserts article with pinned flag when adding to read list", () => {
      const article = makeArticle({ id: "heise:a1" })
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(article)
      })

      expect(mockUpsertMany).toHaveBeenCalledWith([article], { pinned: true })
    })

    it("calls setPinned(id, false) when removing from read list", () => {
      const article = makeArticle({ id: "heise:a1" })
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(article)
      })

      mockSetPinned.mockClear()

      act(() => {
        result.current.removeFromReadList("heise:a1")
      })

      expect(mockSetPinned).toHaveBeenCalledWith("heise:a1", false)
    })

    it("calls bulkSetPinned with all ids when clearing read list", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:a1" }))
        result.current.addToReadList(makeArticle({ id: "heise:a2" }))
      })

      mockBulkSetPinned.mockClear()

      act(() => {
        result.current.clearReadList()
      })

      expect(mockBulkSetPinned).toHaveBeenCalledWith(
        ["heise:a2", "heise:a1"],
        false,
      )
      expect(mockBulkSetPinned).toHaveBeenCalledTimes(1)
    })

    it("upserts articles with pinned flag when restoring read list", () => {
      const articles = [
        makeArticle({ id: "heise:a1" }),
        makeArticle({ id: "heise:a2" }),
      ]

      const { result } = renderHook(() => useArticleState())

      mockUpsertMany.mockClear()

      act(() => {
        result.current.restoreReadList(articles)
      })

      expect(mockUpsertMany).toHaveBeenCalledWith(articles, { pinned: true })
    })

    it("only pins articles that survive the cap when restoring", () => {
      const { result } = renderHook(() => useArticleState())

      // Restore more articles than the cap allows
      const articles = Array.from({ length: MAX_READLIST_ITEMS + 5 }, (_, index) =>
        makeArticle({ id: `heise:art-${index}` }),
      )

      mockUpsertMany.mockClear()

      act(() => {
        result.current.restoreReadList(articles)
      })

      // Only the first MAX_READLIST_ITEMS articles should be pinned
      const pinnedArticles = mockUpsertMany.mock.calls[0][0] as NormalizedArticle[]
      expect(pinnedArticles).toHaveLength(MAX_READLIST_ITEMS)
      expect(pinnedArticles[0].id).toBe("heise:art-0")
      expect(pinnedArticles[MAX_READLIST_ITEMS - 1].id).toBe(`heise:art-${MAX_READLIST_ITEMS - 1}`)
    })

    it("does not affect read-list operations when upsertMany fails", () => {
      mockUpsertMany.mockRejectedValue(new Error("IDB unavailable"))

      const article = makeArticle({ id: "heise:a1" })
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(article)
      })

      // Read list should still work despite IDB failure
      expect(result.current.readListIds).toEqual(["heise:a1"])
    })

    it("does not affect read-list operations when setPinned fails", () => {
      mockSetPinned.mockRejectedValue(new Error("IDB unavailable"))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:a2" }))
      })

      act(() => {
        result.current.removeFromReadList("heise:a2")
      })

      // Read list should still work despite pin failure
      expect(result.current.readListIds).toEqual([])
    })
  })
})
