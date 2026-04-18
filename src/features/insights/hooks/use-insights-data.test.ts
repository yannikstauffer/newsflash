import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useInsightsData } from "./use-insights-data"

import type { StatsStore } from "@/features/stats/stats-store"

// Mock modules that access localStorage or external state
vi.mock("@/features/connectors/registry", () => ({
  connectors: [
    {
      id: "heise",
      name: "Heise",
      language: "de",
      feeds: [{ id: "heise", name: "Heise Online" }],
      filters: [
        {
          id: "heise-plus",
          label: "heise+ (Bezahlinhalte)",
          enabledByDefault: false,
          match: (a: { title: string }) => a.title.startsWith("heise+ |"),
        },
      ],
      parse: () => [],
    },
    {
      id: "srf",
      name: "SRF",
      language: "de",
      feeds: [{ id: "srf", name: "SRF" }],
      filters: [],
      parse: () => [],
    },
  ],
}))

vi.mock("@/features/feed-config/hooks/use-feed-preferences", () => ({
  useFeedPreferences: () => ({ isFeedEnabled: () => true }),
}))

// Default filter pref mock — can be overridden per test
let mockIsFilterEnabled = (_filterId: string, _enabledByDefault: boolean) => false

vi.mock("@/features/feed-config/hooks/use-filter-preferences", () => ({
  useFilterPreferences: () => ({
    isFilterEnabled: (filterId: string, enabledByDefault: boolean) =>
      mockIsFilterEnabled(filterId, enabledByDefault),
  }),
}))

function writeStats(store: StatsStore): void {
  localStorage.setItem("newsflash:stats", JSON.stringify(store))
}

function makeDayStats(
  sources: Record<string, { appeared: number; hidden: number; saved: number }> = {},
  filters: Record<string, { appeared: number; hidden: number; saved: number }> = {},
) {
  return { sources, filters }
}

// Freeze time so todayKey() and getWindowDates() inside the hook always agree,
// even when tests run close to midnight.
const FROZEN_DATE = new Date("2026-04-15T12:00:00Z")

function todayKey(offsetDays = 0): string {
  const d = new Date(FROZEN_DATE)
  d.setDate(d.getDate() - offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FROZEN_DATE)
  localStorage.clear()
  mockIsFilterEnabled = () => false
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe("useInsightsData — hasData", () => {
  it("returns hasData=false when no stats collected", () => {
    const { result } = renderHook(() => useInsightsData())
    expect(result.current.hasData).toBe(false)
  })

  it("returns hasData=true when at least one day bucket exists", () => {
    writeStats({ version: 1, days: { [todayKey()]: makeDayStats() } })
    const { result } = renderHook(() => useInsightsData())
    expect(result.current.hasData).toBe(true)
  })
})

describe("useInsightsData — source stats", () => {
  it("aggregates appeared/hidden/saved over 14-day window", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey(0)]: makeDayStats({ heise: { appeared: 3, hidden: 1, saved: 1 } }),
        [todayKey(5)]: makeDayStats({ heise: { appeared: 2, hidden: 2, saved: 0 } }),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.appeared).toBe(5)
    expect(heise?.hidden).toBe(3)
    expect(heise?.saved).toBe(1)
  })

  it("excludes days outside 14-day window", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey(0)]: makeDayStats({ heise: { appeared: 3, hidden: 0, saved: 0 } }),
        [todayKey(20)]: makeDayStats({ heise: { appeared: 100, hidden: 0, saved: 0 } }),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.appeared).toBe(3)
  })
})

describe("useInsightsData — source recommendations", () => {
  it("recommendDisable=true when hide rate > 50% AND appeared >= 5", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats({ heise: { appeared: 6, hidden: 4, saved: 0 } }),
      },
    })
    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.recommendDisable).toBe(true)
  })

  it("recommendDisable=false when hide rate is exactly 50% (not strictly greater)", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats({ heise: { appeared: 10, hidden: 5, saved: 0 } }),
      },
    })
    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.recommendDisable).toBe(false)
  })

  it("recommendDisable=false when appeared < 5 (below threshold)", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats({ heise: { appeared: 4, hidden: 4, saved: 0 } }),
      },
    })
    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.recommendDisable).toBe(false)
  })

  it("recommendDisable=false when appeared >= 5 but hide rate <= 50%", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats({ heise: { appeared: 10, hidden: 3, saved: 0 } }),
      },
    })
    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.recommendDisable).toBe(false)
  })

  it("hasEnoughData=true when appeared >= 5", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats({ heise: { appeared: 5, hidden: 0, saved: 0 } }),
      },
    })
    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.hasEnoughData).toBe(true)
  })

  it("hasEnoughData=false when appeared < 5", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats({ heise: { appeared: 4, hidden: 0, saved: 0 } }),
      },
    })
    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.hasEnoughData).toBe(false)
  })
})

describe("useInsightsData — noRecentArticles", () => {
  it("noRecentArticles=true when ≥7 stored days exist and appeared=0 in window", () => {
    const days: StatsStore["days"] = {}
    // Create 7 days of stored data with 0 appeared for heise
    for (let index = 0; index < 7; index++) {
      days[todayKey(index)] = makeDayStats({ srf: { appeared: 1, hidden: 0, saved: 0 } })
    }
    writeStats({ version: 1, days })

    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.noRecentArticles).toBe(true)
  })

  it("noRecentArticles=false when fewer than 7 days stored", () => {
    const days: StatsStore["days"] = {}
    for (let index = 0; index < 6; index++) {
      days[todayKey(index)] = makeDayStats({ srf: { appeared: 1, hidden: 0, saved: 0 } })
    }
    writeStats({ version: 1, days })

    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.noRecentArticles).toBe(false)
  })

  it("noRecentArticles=false when source has appeared > 0", () => {
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats({ heise: { appeared: 1, hidden: 0, saved: 0 } }),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const heise = result.current.sources.find((s) => s.feedId === "heise")
    expect(heise?.noRecentArticles).toBe(false)
  })
})

describe("useInsightsData — filter enable recommendation", () => {
  it("recommendEnable=true for disabled filter with ≥5 appeared (blocked articles)", () => {
    mockIsFilterEnabled = () => false // filter is disabled
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats(
          {},
          { "heise-plus": { appeared: 5, hidden: 0, saved: 0 } },
        ),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const filter = result.current.filters.find((f) => f.filterId === "heise-plus")
    expect(filter?.recommendEnable).toBe(true)
  })

  it("recommendEnable=false when appeared < 5 (below threshold)", () => {
    mockIsFilterEnabled = () => false
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats(
          {},
          { "heise-plus": { appeared: 4, hidden: 0, saved: 0 } },
        ),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const filter = result.current.filters.find((f) => f.filterId === "heise-plus")
    expect(filter?.recommendEnable).toBe(false)
  })

  it("recommendEnable=false when filter is already enabled", () => {
    mockIsFilterEnabled = () => true // filter is enabled
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats(
          {},
          { "heise-plus": { appeared: 10, hidden: 8, saved: 0 } },
        ),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const filter = result.current.filters.find((f) => f.filterId === "heise-plus")
    expect(filter?.recommendEnable).toBe(false)
  })
})

describe("useInsightsData — filter disable recommendation", () => {
  it("recommendDisable=true for enabled filter with high hide rate and ≥5 appeared", () => {
    mockIsFilterEnabled = () => true // filter is enabled
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats(
          {},
          { "heise-plus": { appeared: 6, hidden: 4, saved: 0 } },
        ),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const filter = result.current.filters.find((f) => f.filterId === "heise-plus")
    expect(filter?.recommendDisable).toBe(true)
  })

  it("recommendDisable=false when hide rate is exactly 50% (not > 50%)", () => {
    mockIsFilterEnabled = () => true
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats(
          {},
          { "heise-plus": { appeared: 10, hidden: 5, saved: 0 } },
        ),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const filter = result.current.filters.find((f) => f.filterId === "heise-plus")
    expect(filter?.recommendDisable).toBe(false)
  })

  it("recommendDisable=false when appeared < 5 (below threshold)", () => {
    mockIsFilterEnabled = () => true
    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats(
          {},
          { "heise-plus": { appeared: 4, hidden: 3, saved: 0 } },
        ),
      },
    })

    const { result } = renderHook(() => useInsightsData())
    const filter = result.current.filters.find((f) => f.filterId === "heise-plus")
    expect(filter?.recommendDisable).toBe(false)
  })

  it("recommendDisable=false when filter is not enabled", () => {
    mockIsFilterEnabled = () => false // filter disabled

    writeStats({
      version: 1,
      days: {
        [todayKey()]: makeDayStats(
          {},
          { "heise-plus": { appeared: 10, hidden: 8, saved: 0 } },
        ),
      },
    })
    const { result } = renderHook(() => useInsightsData())
    const filter = result.current.filters.find((f) => f.filterId === "heise-plus")
    expect(filter?.recommendDisable).toBe(false)
  })
})

describe("useInsightsData — empty data state", () => {
  it("returns sources and filters with zero counts when no stats collected", () => {
    const { result } = renderHook(() => useInsightsData())
    expect(result.current.sources.length).toBeGreaterThan(0)
    for (const source of result.current.sources) {
      expect(source.appeared).toBe(0)
      expect(source.hidden).toBe(0)
      expect(source.saved).toBe(0)
      expect(source.recommendDisable).toBe(false)
      expect(source.noRecentArticles).toBe(false)
    }
  })

  it("returns empty filter recommendations when no stats", () => {
    const { result } = renderHook(() => useInsightsData())
    for (const filter of result.current.filters) {
      expect(filter.recommendEnable).toBe(false)
      expect(filter.recommendDisable).toBe(false)
    }
  })
})
