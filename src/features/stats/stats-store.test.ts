import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  incrementFilterStat,
  incrementSourceStat,
  readStats,
  writeStats,
} from "./stats-store"

import type { StatsStore } from "./stats-store"

describe("readStats", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("returns empty store when nothing in localStorage", () => {
    const store = readStats()
    expect(store).toEqual({ version: 1, days: {} })
  })

  it("returns empty store when localStorage has invalid JSON", () => {
    localStorage.setItem("newsflash:stats", "not-valid-json")
    expect(readStats()).toEqual({ version: 1, days: {} })
  })

  it("returns empty store when version is wrong", () => {
    localStorage.setItem("newsflash:stats", JSON.stringify({ version: 2, days: {} }))
    expect(readStats()).toEqual({ version: 1, days: {} })
  })

  it("returns stored stats correctly", () => {
    const store: StatsStore = {
      version: 1,
      days: { "2026-04-14": { sources: { heise: { appeared: 3, hidden: 1, saved: 0 } }, filters: {} } },
    }
    localStorage.setItem("newsflash:stats", JSON.stringify(store))
    expect(readStats()).toEqual(store)
  })
})

describe("writeStats", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("persists stats to localStorage", () => {
    const store: StatsStore = {
      version: 1,
      days: { "2026-04-14": { sources: {}, filters: {} } },
    }
    writeStats(store)
    expect(JSON.parse(localStorage.getItem("newsflash:stats") ?? "{}")).toEqual(store)
  })

  it("evicts day buckets older than 90 days on write", () => {
    const old = new Date()
    old.setDate(old.getDate() - 91)
    const oldKey = `${old.getFullYear()}-${String(old.getMonth() + 1).padStart(2, "0")}-${String(old.getDate()).padStart(2, "0")}`

    const recent = new Date()
    const recentKey = `${recent.getFullYear()}-${String(recent.getMonth() + 1).padStart(2, "0")}-${String(recent.getDate()).padStart(2, "0")}`

    const store: StatsStore = {
      version: 1,
      days: {
        [oldKey]: { sources: { heise: { appeared: 5, hidden: 0, saved: 0 } }, filters: {} },
        [recentKey]: { sources: { heise: { appeared: 1, hidden: 0, saved: 0 } }, filters: {} },
      },
    }

    writeStats(store)

    const result = readStats()
    expect(result.days[oldKey]).toBeUndefined()
    expect(result.days[recentKey]).toBeDefined()
  })

  it("keeps day buckets exactly at the 90-day boundary", () => {
    const boundary = new Date()
    boundary.setDate(boundary.getDate() - 90)
    const boundaryKey = `${boundary.getFullYear()}-${String(boundary.getMonth() + 1).padStart(2, "0")}-${String(boundary.getDate()).padStart(2, "0")}`

    const store: StatsStore = {
      version: 1,
      days: {
        [boundaryKey]: { sources: { heise: { appeared: 2, hidden: 0, saved: 0 } }, filters: {} },
      },
    }

    writeStats(store)

    const result = readStats()
    expect(result.days[boundaryKey]).toBeDefined()
  })
})

describe("incrementSourceStat", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("creates a new day bucket and source entry when none exists", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementSourceStat("heise", "appeared", date)

    const store = readStats()
    expect(store.days["2026-04-14"]?.sources["heise"]?.appeared).toBe(1)
  })

  it("increments an existing counter", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementSourceStat("heise", "appeared", date)
    incrementSourceStat("heise", "appeared", date)

    expect(readStats().days["2026-04-14"]?.sources["heise"]?.appeared).toBe(2)
  })

  it("increments hidden counter independently of appeared", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementSourceStat("heise", "appeared", date)
    incrementSourceStat("heise", "hidden", date)

    const source = readStats().days["2026-04-14"]?.sources["heise"]
    expect(source?.appeared).toBe(1)
    expect(source?.hidden).toBe(1)
    expect(source?.saved).toBe(0)
  })

  it("increments saved counter", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementSourceStat("engadget", "saved", date)

    expect(readStats().days["2026-04-14"]?.sources["engadget"]?.saved).toBe(1)
  })

  it("uses today when no date is provided", () => {
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    incrementSourceStat("heise", "appeared")

    expect(readStats().days[todayKey]?.sources["heise"]?.appeared).toBe(1)
  })

  it("tracks multiple sources independently", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementSourceStat("heise", "appeared", date)
    incrementSourceStat("engadget", "appeared", date)
    incrementSourceStat("engadget", "appeared", date)

    const day = readStats().days["2026-04-14"]
    expect(day?.sources["heise"]?.appeared).toBe(1)
    expect(day?.sources["engadget"]?.appeared).toBe(2)
  })
})

describe("incrementFilterStat", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("creates a new filter entry and increments appeared", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementFilterStat("heise-plus", "appeared", date)

    expect(readStats().days["2026-04-14"]?.filters["heise-plus"]?.appeared).toBe(1)
  })

  it("increments hidden counter for filter", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementFilterStat("heise-plus", "hidden", date)

    expect(readStats().days["2026-04-14"]?.filters["heise-plus"]?.hidden).toBe(1)
  })

  it("increments multiple filters independently", () => {
    const date = new Date("2026-04-14T12:00:00")
    incrementFilterStat("heise-plus", "appeared", date)
    incrementFilterStat("heise-angebot", "appeared", date)
    incrementFilterStat("heise-angebot", "appeared", date)

    const day = readStats().days["2026-04-14"]
    expect(day?.filters["heise-plus"]?.appeared).toBe(1)
    expect(day?.filters["heise-angebot"]?.appeared).toBe(2)
  })

  it("uses today when no date is provided", () => {
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    incrementFilterStat("heise-plus", "appeared")

    expect(readStats().days[todayKey]?.filters["heise-plus"]?.appeared).toBe(1)
  })
})

describe("90-day eviction", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it("old bucket written 91 days ago is evicted on next write", () => {
    vi.setSystemTime(new Date("2026-01-01T12:00:00"))
    incrementSourceStat("heise", "appeared")

    vi.setSystemTime(new Date("2026-04-14T12:00:00"))
    incrementSourceStat("heise", "appeared")

    const store = readStats()
    expect(store.days["2026-01-01"]).toBeUndefined()
    expect(store.days["2026-04-14"]).toBeDefined()
  })
})
