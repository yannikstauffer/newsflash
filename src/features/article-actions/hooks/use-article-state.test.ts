import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  HIDDEN_TTL_DAYS,
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
    it("exports HIDDEN_TTL_DAYS as 14", () => {
      expect(HIDDEN_TTL_DAYS).toBe(14)
    })

    it("exports MAX_READLIST_ITEMS as 200", () => {
      expect(MAX_READLIST_ITEMS).toBe(200)
    })
  })

  describe("hideArticle time-based eviction (14-day window)", () => {
    const NOW_ISO = "2026-04-23T12:00:00.000Z"

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(NOW_ISO))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("evicts entries older than 14 days on next write", () => {
      const fifteenDaysAgo = "2026-04-08T12:00:00.000Z"
      const sevenDaysAgo = "2026-04-16T12:00:00.000Z"

      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify([
          { id: "heise:old", hiddenAt: fifteenDaysAgo },
          { id: "heise:recent", hiddenAt: sevenDaysAgo },
        ]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("heise:new")
      })

      expect(result.current.hiddenIds).toContain("heise:new")
      expect(result.current.hiddenIds).toContain("heise:recent")
      expect(result.current.hiddenIds).not.toContain("heise:old")
    })

    it("does not apply a count-based cap when all entries are within the window", () => {
      const recent = "2026-04-20T12:00:00.000Z"
      const entries = Array.from({ length: 600 }, (_, index) => ({
        id: `src:id-${index}`,
        hiddenAt: recent,
      }))
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(entries))

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("src:new-id")
      })

      expect(result.current.hiddenIds).toHaveLength(601)
      expect(result.current.hiddenIds[0]).toBe("src:new-id")
      expect(result.current.hiddenIds).toContain("src:id-599")
    })

    it("migrates legacy string[] entries by stamping them with current time", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["heise:legacy-1", "heise:legacy-2"]),
      )

      const { result } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).toEqual(["heise:legacy-1", "heise:legacy-2"])

      // Subsequent write persists timestamped shape to storage.
      act(() => {
        result.current.hideArticle("heise:new")
      })

      const stored: unknown = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]")
      expect(Array.isArray(stored)).toBe(true)
      expect(stored).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "heise:legacy-1", hiddenAt: expect.any(String) }),
          expect.objectContaining({ id: "heise:legacy-2", hiddenAt: expect.any(String) }),
          { id: "heise:new", hiddenAt: NOW_ISO },
        ]),
      )
    })

    it("persists timestamped entries to localStorage on hideArticle", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("heise:fresh")
      })

      const stored = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]")
      expect(stored).toEqual([{ id: "heise:fresh", hiddenAt: NOW_ISO }])
    })

    it("evicts expired entries without any explicit write (filters in hiddenIds)", () => {
      const fifteenDaysAgo = "2026-04-08T12:00:00.000Z"
      const sevenDaysAgo = "2026-04-16T12:00:00.000Z"

      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify([
          { id: "heise:old", hiddenAt: fifteenDaysAgo },
          { id: "heise:recent", hiddenAt: sevenDaysAgo },
        ]),
      )

      const { result } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).toContain("heise:recent")
      expect(result.current.hiddenIds).not.toContain("heise:old")
      expect(result.current.isHidden("heise:old")).toBe(false)
      expect(result.current.isHidden("heise:recent")).toBe(true)
    })

    it("evicts entries that expire after mount when the hook rerenders", () => {
      const ttlMs = HIDDEN_TTL_DAYS * 24 * 60 * 60 * 1000
      const nearExpiryHiddenAt = new Date(Date.now() - ttlMs + 1000).toISOString()

      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify([{ id: "heise:soon-expired", hiddenAt: nearExpiryHiddenAt }]),
      )

      const { result, rerender } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).toContain("heise:soon-expired")
      expect(result.current.isHidden("heise:soon-expired")).toBe(true)

      act(() => {
        vi.advanceTimersByTime(1001)
      })

      rerender()

      expect(result.current.hiddenIds).not.toContain("heise:soon-expired")
      expect(result.current.isHidden("heise:soon-expired")).toBe(false)
    })

    it("hideArticles batch stamps all new entries with current time", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticles(["heise:a", "heise:b"])
      })

      const stored = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]")
      expect(stored).toEqual([
        { id: "heise:a", hiddenAt: NOW_ISO },
        { id: "heise:b", hiddenAt: NOW_ISO },
      ])
    })

    it("unhideArticle removes the entry from storage", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify([
          { id: "heise:a", hiddenAt: NOW_ISO },
          { id: "heise:b", hiddenAt: NOW_ISO },
        ]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.unhideArticle("heise:a")
      })

      expect(result.current.hiddenIds).toEqual(["heise:b"])
      const stored = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]")
      expect(stored).toEqual([{ id: "heise:b", hiddenAt: NOW_ISO }])
    })

    it("removeHiddenBySource filters timestamped entries by id prefix", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify([
          { id: "heise:a", hiddenAt: NOW_ISO },
          { id: "heise:b", hiddenAt: NOW_ISO },
          { id: "srf:c", hiddenAt: NOW_ISO },
        ]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.removeHiddenBySource("heise")
      })

      expect(result.current.hiddenIds).toEqual(["srf:c"])
    })

    it("uses :updated_at as the legacy timestamp so legacy strings can age out via TTL", () => {
      const sixteenDaysAgo = "2026-04-07T12:00:00.000Z"
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(["heise:legacy"]))
      localStorage.setItem(`${HIDDEN_KEY}:updated_at`, sixteenDaysAgo)

      const { result } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).not.toContain("heise:legacy")
    })

    it("uses a stable fallback stamp when :updated_at is absent so legacy strings still age out", () => {
      // Old install: localStorage has legacy string[] but no `:updated_at` companion key.
      // The fallback must be stable across renders, otherwise each render re-stamps with `now`
      // and the entry never crosses the TTL boundary.
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(["heise:legacy"]))
      expect(localStorage.getItem(`${HIDDEN_KEY}:updated_at`)).toBeNull()

      const { result, rerender } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).toContain("heise:legacy")

      // Advance past the 14-day TTL relative to first-mount time.
      act(() => {
        vi.advanceTimersByTime(15 * 24 * 60 * 60 * 1000)
      })
      rerender()

      expect(result.current.hiddenIds).not.toContain("heise:legacy")
    })

    it("ignores hideArticle calls with unprefixed IDs", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("not-prefixed")
      })

      expect(result.current.hiddenIds).toEqual([])
      expect(localStorage.getItem(HIDDEN_KEY)).toBeNull()
    })
  })

  describe("addToReadList pruning", () => {
    it("ignores articles with unprefixed IDs", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(makeArticle({ id: "no-prefix" }))
      })

      expect(result.current.readListIds).toEqual([])
      expect(mockUpsertMany).not.toHaveBeenCalled()
    })

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

    it("unpins the dropped article when adding at max capacity", () => {
      const { result } = renderHook(() => useArticleState())

      act(() => {
        for (let index = 0; index < MAX_READLIST_ITEMS; index++) {
          result.current.addToReadList(makeArticle({ id: `heise:art-${index}` }))
        }
      })

      mockSetPinned.mockClear()

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:new-art" }))
      })

      expect(mockSetPinned).toHaveBeenCalledWith("heise:art-0", false)
    })

    it("skips IDB upsert when adding a duplicate article", () => {
      const article = makeArticle({ id: "heise:a1" })
      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(article)
      })

      mockUpsertMany.mockClear()

      act(() => {
        result.current.addToReadList(article)
      })

      expect(mockUpsertMany).not.toHaveBeenCalled()
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

    it("unpins legacy unprefixed entries dropped by the prefix filter on add", () => {
      const stored = [
        {
          id: "legacy-pinned",
          title: "Legacy",
          description: "Old",
          link: "https://example.com",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
      ]
      localStorage.setItem(READLIST_KEY, JSON.stringify(stored))

      const { result } = renderHook(() => useArticleState())
      mockBulkSetPinned.mockClear()

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:new" }))
      })

      expect(mockBulkSetPinned).toHaveBeenCalledWith(["legacy-pinned"], false)
    })
  })

  describe("removeFromReadList legacy cleanup", () => {
    it("unpins legacy unprefixed entries dropped by the prefix filter", () => {
      const stored = [
        {
          id: "legacy-pinned",
          title: "Legacy",
          description: "Old",
          link: "https://example.com",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
        {
          id: "heise:target",
          title: "Target",
          description: "T",
          link: "https://example.com/target",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
      ]
      localStorage.setItem(READLIST_KEY, JSON.stringify(stored))

      const { result } = renderHook(() => useArticleState())
      mockBulkSetPinned.mockClear()
      mockSetPinned.mockClear()

      act(() => {
        result.current.removeFromReadList("heise:target")
      })

      expect(mockBulkSetPinned).toHaveBeenCalledWith(["legacy-pinned"], false)
      expect(mockSetPinned).toHaveBeenCalledWith("heise:target", false)
    })
  })

  describe("restoreReadList legacy cleanup", () => {
    it("unpins legacy unprefixed entries dropped by the prefix filter", () => {
      const stored = [
        {
          id: "legacy-pinned",
          title: "Legacy",
          description: "Old",
          link: "https://example.com",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
      ]
      localStorage.setItem(READLIST_KEY, JSON.stringify(stored))

      const { result } = renderHook(() => useArticleState())
      mockBulkSetPinned.mockClear()

      act(() => {
        result.current.restoreReadList([makeArticle({ id: "heise:restored" })])
      })

      const allDropped = mockBulkSetPinned.mock.calls.flatMap(([ids]) => ids as string[])
      expect(allDropped).toContain("legacy-pinned")
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

    it("unpins removed articles in IDB when removing by source", () => {
      const heiseArticle1 = makeArticle({ id: "heise:h1", source: "heise" })
      const heiseArticle2 = makeArticle({ id: "heise:h2", source: "heise" })
      const srfArticle = makeArticle({ id: "srf:s1", source: "srf" })

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.addToReadList(heiseArticle1)
        result.current.addToReadList(heiseArticle2)
        result.current.addToReadList(srfArticle)
      })

      mockBulkSetPinned.mockClear()

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(mockBulkSetPinned).toHaveBeenCalledWith(
        ["heise:h2", "heise:h1"],
        false,
      )
    })

    it("unpins legacy unprefixed entries from non-matching sources dropped by the prefix filter", () => {
      const stored = [
        {
          id: "legacy-srf",
          title: "Legacy SRF",
          description: "Old",
          link: "https://example.com",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "srf",
          language: "de",
        },
        {
          id: "heise:to-remove",
          title: "Heise",
          description: "H",
          link: "https://example.com/h",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
      ]
      localStorage.setItem(READLIST_KEY, JSON.stringify(stored))

      const { result } = renderHook(() => useArticleState())
      mockBulkSetPinned.mockClear()

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      const allUnpinned = mockBulkSetPinned.mock.calls.flatMap(([ids]) => ids as string[])
      expect(allUnpinned).toContain("legacy-srf")
      expect(allUnpinned).toContain("heise:to-remove")
    })

    it("unpins legacy unprefixed IDs whose source matches", () => {
      const stored = [
        {
          id: "legacyHeise",
          title: "Legacy",
          description: "Old",
          link: "https://example.com",
          publishedAt: "2026-01-15T10:00:00.000Z",
          source: "heise",
          language: "de",
        },
        {
          id: "heise:valid",
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

      act(() => {
        result.current.removeReadListBySource("heise")
      })

      expect(mockBulkSetPinned).toHaveBeenCalledWith(
        ["legacyHeise", "heise:valid"],
        false,
      )
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

    it("unpins legacy unprefixed IDs from IDB so they are not protected from eviction", () => {
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
          id: "heise:valid",
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

      act(() => {
        result.current.clearReadList()
      })

      expect(mockBulkSetPinned).toHaveBeenCalledWith(
        ["legacy123", "heise:valid"],
        false,
      )
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

  describe("legacy data normalization on read", () => {
    it("does not write to localStorage on mount when hidden contains legacy string[] data", () => {
      // Regression: previously the migration effect wrote a normalized array via
      // useSyncedStorage, which bumped `:updated_at` to now and caused this device to
      // win the LWW sync and clobber hides made on another device.
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["heise:legacy-1", "heise:legacy-2"]),
      )
      const beforeTimestamp = "2026-01-01T00:00:00.000Z"
      localStorage.setItem(`${HIDDEN_KEY}:updated_at`, beforeTimestamp)
      const beforeRaw = localStorage.getItem(HIDDEN_KEY)

      renderHook(() => useArticleState())

      expect(localStorage.getItem(`${HIDDEN_KEY}:updated_at`)).toBe(beforeTimestamp)
      expect(localStorage.getItem(HIDDEN_KEY)).toBe(beforeRaw)
    })

    it("does not write to localStorage on mount when read list contains unprefixed entries", () => {
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
      ]
      localStorage.setItem(READLIST_KEY, JSON.stringify(stored))
      const beforeTimestamp = "2026-01-01T00:00:00.000Z"
      localStorage.setItem(`${READLIST_KEY}:updated_at`, beforeTimestamp)
      const beforeRaw = localStorage.getItem(READLIST_KEY)

      renderHook(() => useArticleState())

      expect(localStorage.getItem(`${READLIST_KEY}:updated_at`)).toBe(beforeTimestamp)
      expect(localStorage.getItem(READLIST_KEY)).toBe(beforeRaw)
    })

    it("filters legacy hidden IDs without colon separator", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["abc123", "def456", "heise:valid"]),
      )

      const { result } = renderHook(() => useArticleState())

      expect(result.current.hiddenIds).toEqual(["heise:valid"])
    })

    it("drops legacy unprefixed hidden entries from storage on next mutation", () => {
      localStorage.setItem(
        HIDDEN_KEY,
        JSON.stringify(["abc123", "heise:valid"]),
      )

      const { result } = renderHook(() => useArticleState())

      act(() => {
        result.current.hideArticle("heise:new")
      })

      const storedHidden: Array<{ id: string }> = JSON.parse(
        localStorage.getItem(HIDDEN_KEY) ?? "[]",
      )
      expect(storedHidden.map((entry) => entry.id)).toEqual(["heise:new", "heise:valid"])
    })

    it("drops legacy unprefixed read list entries from storage on next mutation", () => {
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
          id: "heise:valid",
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

      act(() => {
        result.current.addToReadList(makeArticle({ id: "heise:added" }))
      })

      const after: Array<{ id: string }> = JSON.parse(
        localStorage.getItem(READLIST_KEY) ?? "[]",
      )
      expect(after.map((entry) => entry.id)).toEqual(["heise:added", "heise:valid"])
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

    it("unpins previous items dropped by cap when restoring", () => {
      const { result } = renderHook(() => useArticleState())

      // Fill read list to capacity
      act(() => {
        for (let index = 0; index < MAX_READLIST_ITEMS; index++) {
          result.current.addToReadList(makeArticle({ id: `heise:existing-${index}` }))
        }
      })

      mockBulkSetPinned.mockClear()

      // Restore articles that push existing ones past the cap
      const newArticles = Array.from({ length: 10 }, (_, index) =>
        makeArticle({ id: `heise:new-${index}` }),
      )

      act(() => {
        result.current.restoreReadList(newArticles)
      })

      // The last 10 existing items should be unpinned
      const unpinCall = mockBulkSetPinned.mock.calls.find(
        ([, pinned]) => pinned === false,
      )
      expect(unpinCall).toBeDefined()
      const unpinnedIds = unpinCall![0] as string[]
      expect(unpinnedIds).toHaveLength(10)
      for (let index = 0; index < 10; index++) {
        expect(unpinnedIds).toContain(`heise:existing-${index}`)
      }
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
