import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  MAX_HIDDEN_IDS,
  MAX_READLIST_ITEMS,
  useArticleState,
} from "./use-article-state"

import type { NormalizedArticle } from "@/features/connectors/types"

const HIDDEN_KEY = "newsflash:hidden"
const READLIST_KEY = "newsflash:readlist"

function makeArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    id: "abc123",
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
      const ids = Array.from({ length: 10 }, (_, index) => `id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("new-id")
      })

      expect(result.current.hiddenIds).toHaveLength(11)
      expect(result.current.hiddenIds[0]).toBe("new-id")
    })

    it("drops the oldest entry when hiding at exactly max capacity", () => {
      const ids = Array.from({ length: MAX_HIDDEN_IDS }, (_, index) => `id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("new-id")
      })

      expect(result.current.hiddenIds).toHaveLength(MAX_HIDDEN_IDS)
      expect(result.current.hiddenIds[0]).toBe("new-id")
      expect(result.current.hiddenIds).not.toContain(`id-${MAX_HIDDEN_IDS - 1}`)
    })

    it("truncates an oversized existing list to max on next write", () => {
      const ids = Array.from({ length: MAX_HIDDEN_IDS + 50 }, (_, index) => `id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("new-id")
      })

      expect(result.current.hiddenIds).toHaveLength(MAX_HIDDEN_IDS)
      expect(result.current.hiddenIds[0]).toBe("new-id")
    })

    it("does not change the list when hiding a duplicate ID", () => {
      const ids = Array.from({ length: MAX_HIDDEN_IDS }, (_, index) => `id-${index}`)
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))

      const { result } = renderHook(() => useArticleState())
      const before = result.current.hiddenIds

      act(() => {
        result.current.hideArticle("id-0")
      })

      expect(result.current.hiddenIds).toBe(before)
    })
  })

  describe("addToReadList pruning", () => {
    it("does not prune when list is under the limit", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        for (let index = 0; index < 10; index++) {
          result.current.addToReadList(makeArticle({ id: `art-${index}` }))
        }
      })

      expect(result.current.readListArticles).toHaveLength(10)
    })

    it("drops the oldest article when adding at exactly max capacity", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        for (let index = 0; index < MAX_READLIST_ITEMS; index++) {
          result.current.addToReadList(makeArticle({ id: `art-${index}` }))
        }
      })

      expect(result.current.readListArticles).toHaveLength(MAX_READLIST_ITEMS)

      act(() => {
        result.current.addToReadList(makeArticle({ id: "new-art" }))
      })

      expect(result.current.readListArticles).toHaveLength(MAX_READLIST_ITEMS)
      expect(result.current.readListIds[0]).toBe("new-art")
      expect(result.current.readListIds).not.toContain("art-0")
    })

    it("truncates an oversized existing list to max on next write", () => {
      const stored = Array.from({ length: MAX_READLIST_ITEMS + 30 }, (_, index) => ({
        id: `art-${index}`,
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
        result.current.addToReadList(makeArticle({ id: "new-art" }))
      })

      expect(result.current.readListArticles).toHaveLength(MAX_READLIST_ITEMS)
      expect(result.current.readListIds[0]).toBe("new-art")
    })

    it("does not change the list when adding a duplicate article", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "art-1" }))
      })

      const before = result.current.readListArticles

      act(() => {
        result.current.addToReadList(makeArticle({ id: "art-1" }))
      })

      expect(result.current.readListArticles).toBe(before)
    })
  })

  describe("removeReadListBySource", () => {
    it("removes read list entries matching the source", () => {
      const heiseArticle = makeArticle({ id: "h1", source: "heise" })
      const srfArticle = makeArticle({ id: "s1", source: "srf" })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(heiseArticle)
        result.current.addToReadList(srfArticle)
      })

      expect(result.current.readListIds).toHaveLength(2)

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(result.current.readListIds).toEqual(["s1"])
      expect(result.current.readListArticles).toHaveLength(1)
      expect(result.current.readListArticles[0].source).toBe("srf")
    })

    it("does not remove entries from other sources", () => {
      const srfArticle = makeArticle({ id: "s1", source: "srf" })
      const engadgetArticle = makeArticle({ id: "e1", source: "engadget" })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(srfArticle)
        result.current.addToReadList(engadgetArticle)
      })

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(result.current.readListIds).toEqual(["e1", "s1"])
    })

    it("handles empty read list", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(result.current.readListArticles).toEqual([])
    })

    it("persists cleanup to localStorage", () => {
      const heiseArticle = makeArticle({ id: "h1", source: "heise" })

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
})
