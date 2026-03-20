import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useArticleState } from "./use-article-state"

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
