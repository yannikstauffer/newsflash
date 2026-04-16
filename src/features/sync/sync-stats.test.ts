import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  computeStatsDelta,
  mergeStats,
  performSync,
  readStatsSnapshot,
  SYNCED_KEYS,
  writeStatsSnapshot,
} from "./sync-service"

import type { StatsStore } from "@/features/stats/stats-store"
import type { SupabaseClient } from "@supabase/supabase-js"

function makeStore(days: StatsStore["days"]): StatsStore {
  return { version: 1, days }
}

function makeDayStats(
  sources: Record<string, { appeared: number; hidden: number; saved: number }> = {},
  filters: Record<string, { appeared: number; hidden: number; saved: number }> = {},
) {
  return { sources, filters }
}

describe("computeStatsDelta", () => {
  it("returns full local when snapshot is null (first sync)", () => {
    const current = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 2, saved: 1 } }),
    })
    const delta = computeStatsDelta(current, null)
    expect(delta.days["2026-04-14"]?.sources["heise"]).toEqual({
      appeared: 5, hidden: 2, saved: 1,
    })
  })

  it("returns zero-diff as empty delta when current equals snapshot", () => {
    const store = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 2, saved: 1 } }),
    })
    const delta = computeStatsDelta(store, store)
    expect(Object.keys(delta.days)).toHaveLength(0)
  })

  it("returns only the increment since last snapshot", () => {
    const snapshot = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 3, hidden: 1, saved: 0 } }),
    })
    const current = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 1, saved: 1 } }),
    })
    const delta = computeStatsDelta(current, snapshot)
    expect(delta.days["2026-04-14"]?.sources["heise"]).toEqual({
      appeared: 2, hidden: 0, saved: 1,
    })
  })

  it("does not produce negative delta values", () => {
    // Counter in snapshot is higher than current (e.g. storage cleared)
    const snapshot = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 10, hidden: 0, saved: 0 } }),
    })
    const current = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 2, hidden: 0, saved: 0 } }),
    })
    const delta = computeStatsDelta(current, snapshot)
    expect(Object.keys(delta.days)).toHaveLength(0)
  })

  it("computes delta for filters too", () => {
    const snapshot = makeStore({
      "2026-04-14": makeDayStats(
        {},
        { "heise-plus": { appeared: 2, hidden: 1, saved: 0 } },
      ),
    })
    const current = makeStore({
      "2026-04-14": makeDayStats(
        {},
        { "heise-plus": { appeared: 4, hidden: 2, saved: 0 } },
      ),
    })
    const delta = computeStatsDelta(current, snapshot)
    expect(delta.days["2026-04-14"]?.filters["heise-plus"]).toEqual({
      appeared: 2, hidden: 1, saved: 0,
    })
  })
})

describe("mergeStats", () => {
  it("returns delta as merged when remote is null", () => {
    const delta = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 2, saved: 1 } }),
    })
    const merged = mergeStats(null, delta)
    expect(merged.days["2026-04-14"]?.sources["heise"]).toEqual({
      appeared: 5, hidden: 2, saved: 1,
    })
  })

  it("adds delta to remote counters", () => {
    const remote = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 3, hidden: 1, saved: 0 } }),
    })
    const delta = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 2, hidden: 1, saved: 1 } }),
    })
    const merged = mergeStats(remote, delta)
    expect(merged.days["2026-04-14"]?.sources["heise"]).toEqual({
      appeared: 5, hidden: 2, saved: 1,
    })
  })

  it("preserves remote days not in delta", () => {
    const remote = makeStore({
      "2026-04-13": makeDayStats({ heise: { appeared: 10, hidden: 0, saved: 0 } }),
    })
    const delta = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 2, hidden: 0, saved: 0 } }),
    })
    const merged = mergeStats(remote, delta)
    expect(merged.days["2026-04-13"]?.sources["heise"]?.appeared).toBe(10)
    expect(merged.days["2026-04-14"]?.sources["heise"]?.appeared).toBe(2)
  })

  it("handles two-device scenario: Device A appeared=5, Device B appeared=3 → merged=8", () => {
    // Device A has appeared=5, snapshot was 0 → delta=5
    const deltaA = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 0, saved: 0 } }),
    })
    // Remote has Device B data: appeared=3
    const remoteWithB = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 3, hidden: 0, saved: 0 } }),
    })
    const merged = mergeStats(remoteWithB, deltaA)
    expect(merged.days["2026-04-14"]?.sources["heise"]?.appeared).toBe(8)
  })

  it("merges filter counters correctly", () => {
    const remote = makeStore({
      "2026-04-14": makeDayStats({}, { "heise-plus": { appeared: 3, hidden: 1, saved: 0 } }),
    })
    const delta = makeStore({
      "2026-04-14": makeDayStats({}, { "heise-plus": { appeared: 2, hidden: 1, saved: 0 } }),
    })
    const merged = mergeStats(remote, delta)
    expect(merged.days["2026-04-14"]?.filters["heise-plus"]).toEqual({
      appeared: 5, hidden: 2, saved: 0,
    })
  })
})

describe("readStatsSnapshot / writeStatsSnapshot", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("returns null when no snapshot exists", () => {
    expect(readStatsSnapshot()).toBeNull()
  })

  it("round-trips snapshot through localStorage", () => {
    const store = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 0, saved: 0 } }),
    })
    writeStatsSnapshot(store)
    expect(readStatsSnapshot()).toEqual(store)
  })
})

describe("SYNCED_KEYS includes stats with additiveMerge flag", () => {
  it("includes newsflash:stats key", () => {
    const statsKey = SYNCED_KEYS.find((k) => k.storageKey === "newsflash:stats")
    expect(statsKey).toBeDefined()
    expect(statsKey?.remoteKey).toBe("stats")
    expect(statsKey?.additiveMerge).toBe(true)
  })
})

function createMockSupabaseForStats(
  remoteRows: Array<{ key: string; data: unknown; updated_at: string }>,
) {
  const selectMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({
      data: remoteRows.map((r) => ({ ...r, user_id: "user-1" })),
      error: null,
    }),
  })
  const matchMock = vi.fn().mockResolvedValue({ error: null })
  const updateMock = vi.fn().mockReturnValue({ match: matchMock })
  const upsertMock = vi.fn().mockResolvedValue({ error: null })
  const fromMock = vi.fn().mockReturnValue({
    select: selectMock,
    upsert: upsertMock,
    update: updateMock,
  })
  return { client: { from: fromMock } as unknown as SupabaseClient, upsertMock, updateMock, matchMock }
}

describe("performSync stats additive merge", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-04-14T12:00:00"))
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("pushes local stats as delta on first sync (no remote)", async () => {
    const localStats: StatsStore = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 2, saved: 1 } }),
    })
    localStorage.setItem("newsflash:stats", JSON.stringify(localStats))

    // Remote has no other keys either
    const { client, upsertMock } = createMockSupabaseForStats([])

    await performSync(client, "user-1")

    const statsUpsert = upsertMock.mock.calls.find(
      (call: Array<{ key: string; data: StatsStore }>) => call[0]?.key === "stats",
    )
    if (!statsUpsert) throw new Error("statsUpsert call not found")
    const pushedData = statsUpsert[0].data as StatsStore
    expect(pushedData.days["2026-04-14"]?.sources["heise"]?.appeared).toBe(5)
  })

  it("re-syncing from same device does not double-count (idempotency)", async () => {
    const stats: StatsStore = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 0, saved: 0 } }),
    })
    localStorage.setItem("newsflash:stats", JSON.stringify(stats))
    // Snapshot matches local → delta = 0
    writeStatsSnapshot(stats)

    const remoteStats: StatsStore = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 5, hidden: 0, saved: 0 } }),
    })

    const { client, updateMock } = createMockSupabaseForStats([
      { key: "stats", data: remoteStats, updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "hidden", data: [], updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "filterprefs", data: {}, updated_at: "2026-04-14T10:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    // Delta is empty (snapshot === local) → short-circuit: no write to Supabase,
    // just pull remote into local. Verify no unnecessary network write happened.
    expect(updateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ version: 1 }) }),
    )
    // Local stats should equal remote (5 appeared, not double-counted as 10)
    const localAfter = JSON.parse(localStorage.getItem("newsflash:stats") ?? "null") as StatsStore
    expect(localAfter.days["2026-04-14"]?.sources["heise"]?.appeared).toBe(5)
  })

  it("snapshot is saved after successful sync", async () => {
    const localStats: StatsStore = makeStore({
      "2026-04-14": makeDayStats({ heise: { appeared: 3, hidden: 0, saved: 0 } }),
    })
    localStorage.setItem("newsflash:stats", JSON.stringify(localStats))

    const { client } = createMockSupabaseForStats([
      { key: "stats", data: makeStore({}), updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "hidden", data: [], updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2026-04-14T10:00:00.000Z" },
      { key: "filterprefs", data: {}, updated_at: "2026-04-14T10:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    const snapshot = readStatsSnapshot()
    expect(snapshot).not.toBeNull()
    expect(snapshot?.days["2026-04-14"]?.sources["heise"]?.appeared).toBe(3)
  })
})
