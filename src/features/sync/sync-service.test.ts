import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getLastSyncedTimestamp, isSyncStale, performSync, SYNCED_KEYS } from "./sync-service"

import type { LocalStorageSyncDetail } from "@/hooks/use-local-storage"
import type { SupabaseClient } from "@supabase/supabase-js"

import { LOCAL_STORAGE_SYNC_EVENT } from "@/hooks/use-local-storage"

function createMockSupabase(remoteRows: Array<{ key: string; data: unknown; updated_at: string }> = []) {
  const selectMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: remoteRows.map((r) => ({ ...r, user_id: "user-1" })), error: null }),
  })

  const matchMock = vi.fn().mockResolvedValue({ error: null })
  const updateMock = vi.fn().mockReturnValue({ match: matchMock })
  const upsertMock = vi.fn().mockResolvedValue({ error: null })

  const fromMock = vi.fn().mockReturnValue({
    select: selectMock,
    upsert: upsertMock,
    update: updateMock,
  })

  return {
    client: { from: fromMock } as unknown as SupabaseClient,
    fromMock,
    upsertMock,
    updateMock,
    matchMock,
  }
}

describe("performSync", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("pushes local data to remote on first login (no remote rows)", async () => {
    localStorage.setItem("newsflash:hidden", JSON.stringify(["article-1"]))
    localStorage.setItem("newsflash:hidden:updated_at", "2025-01-01T00:00:00.000Z")

    const { client, upsertMock } = createMockSupabase([])

    await performSync(client, "user-1")

    expect(upsertMock).toHaveBeenCalledTimes(SYNCED_KEYS.length)
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        key: "hidden",
        data: ["article-1"],
        updated_at: "2025-01-01T00:00:00.000Z",
      }),
    )
  })

  it("pulls remote data when remote is newer", async () => {
    localStorage.setItem("newsflash:hidden", JSON.stringify(["old-article"]))
    localStorage.setItem("newsflash:hidden:updated_at", "2025-01-01T00:00:00.000Z")

    const { client } = createMockSupabase([
      { key: "hidden", data: ["new-article"], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "filterprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    expect(JSON.parse(localStorage.getItem("newsflash:hidden") ?? "[]")).toEqual(["new-article"])
    expect(localStorage.getItem("newsflash:hidden:updated_at")).toBe("2025-06-01T00:00:00.000Z")
  })

  it("pushes local data when local is newer", async () => {
    localStorage.setItem("newsflash:hidden", JSON.stringify(["local-article"]))
    localStorage.setItem("newsflash:hidden:updated_at", "2025-06-01T00:00:00.000Z")

    const { client, updateMock, matchMock } = createMockSupabase([
      { key: "hidden", data: ["old-article"], updated_at: "2025-01-01T00:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "filterprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    expect(updateMock).toHaveBeenCalledWith({
      data: ["local-article"],
      updated_at: "2025-06-01T00:00:00.000Z",
    })
    expect(matchMock).toHaveBeenCalledWith({ user_id: "user-1", key: "hidden" })
  })

  it("does not transfer data when timestamps are equal", async () => {
    const timestamp = "2025-03-01T00:00:00.000Z"
    localStorage.setItem("newsflash:hidden", JSON.stringify(["same-article"]))
    localStorage.setItem("newsflash:hidden:updated_at", timestamp)

    const { client, updateMock, upsertMock } = createMockSupabase([
      { key: "hidden", data: ["same-article"], updated_at: timestamp },
      { key: "readlist", data: [], updated_at: timestamp },
      { key: "feedprefs", data: {}, updated_at: timestamp },
      { key: "filterprefs", data: {}, updated_at: timestamp },
      { key: "stats", data: { version: 1, days: {} }, updated_at: timestamp },
    ])

    await performSync(client, "user-1")

    // update should not have been called for "hidden" since timestamps are equal
    // (remote is equal, so we "pull" which just overwrites with same data)
    // The stats key always uses additive merge — it calls update with the merged value
    expect(updateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.arrayContaining(["same-article"]) }),
    )
    // upsert should not have been called for any non-stats key
    const nonStatsUpserts = upsertMock.mock.calls.filter(
      (call: Array<{ key: string }>) => call[0]?.key !== "stats",
    )
    expect(nonStatsUpserts).toHaveLength(0)
  })

  it("updates last-synced timestamp after successful sync", async () => {
    const { client } = createMockSupabase([
      { key: "hidden", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "filterprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    expect(localStorage.getItem("newsflash:last-synced")).toBeTruthy()
  })

  it("throws on fetch error and does not update last-synced", async () => {
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: "Network error" } }),
    })
    const client = {
      from: vi.fn().mockReturnValue({ select: selectMock }),
    } as unknown as SupabaseClient

    await expect(performSync(client, "user-1")).rejects.toThrow("Failed to fetch remote settings")
    expect(localStorage.getItem("newsflash:last-synced")).toBeNull()
  })
})

describe("getLastSyncedTimestamp", () => {
  afterEach(() => {
    localStorage.clear()
  })

  it("returns null when no timestamp exists", () => {
    expect(getLastSyncedTimestamp()).toBeNull()
  })

  it("returns the stored timestamp", () => {
    localStorage.setItem("newsflash:last-synced", "2025-01-01T00:00:00.000Z")
    expect(getLastSyncedTimestamp()).toBe("2025-01-01T00:00:00.000Z")
  })
})

describe("performSync event dispatch", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("dispatches sync events when remote data is pulled", async () => {
    localStorage.setItem("newsflash:hidden", JSON.stringify(["old"]))
    localStorage.setItem("newsflash:hidden:updated_at", "2025-01-01T00:00:00.000Z")

    const events: string[] = []
    const listener = (event_: Event) => {
      events.push((event_ as CustomEvent<LocalStorageSyncDetail>).detail.key)
    }
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    const { client } = createMockSupabase([
      { key: "hidden", data: ["new"], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "filterprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    // All keys should have events dispatched (remote is newer or equal for all)
    expect(events).toContain("newsflash:hidden")
    expect(events).toContain("newsflash:readlist")
    expect(events).toContain("newsflash:feed-prefs")
    expect(events).toContain("newsflash:filter-prefs")
  })

  it("does not dispatch sync event when local wins", async () => {
    localStorage.setItem("newsflash:hidden", JSON.stringify(["local"]))
    localStorage.setItem("newsflash:hidden:updated_at", "2025-06-01T00:00:00.000Z")

    const events: string[] = []
    const listener = (event_: Event) => {
      events.push((event_ as CustomEvent<LocalStorageSyncDetail>).detail.key)
    }
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    const { client } = createMockSupabase([
      { key: "hidden", data: ["old"], updated_at: "2025-01-01T00:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "filterprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    // hidden should NOT be dispatched (local wins), others should be (remote wins/equal)
    expect(events).not.toContain("newsflash:hidden")
  })

  it("does not dispatch sync event on first login (upsert path) for non-stats keys", async () => {
    localStorage.setItem("newsflash:hidden", JSON.stringify(["article-1"]))
    localStorage.setItem("newsflash:hidden:updated_at", "2025-01-01T00:00:00.000Z")

    const events: string[] = []
    const listener = (event_: Event) => {
      events.push((event_ as CustomEvent<LocalStorageSyncDetail>).detail.key)
    }
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    const { client } = createMockSupabase([])

    await performSync(client, "user-1")

    window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    // hidden/readlist/feedprefs/filterprefs should NOT dispatch events on first login (upsert path)
    // stats always dispatches via the additive merge path
    expect(events).not.toContain("newsflash:hidden")
    expect(events).not.toContain("newsflash:readlist")
    expect(events).not.toContain("newsflash:feed-prefs")
    expect(events).not.toContain("newsflash:filter-prefs")
  })
})

describe("performSync includes filter-prefs", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("includes newsflash:filter-prefs in SYNCED_KEYS", () => {
    expect(SYNCED_KEYS.some((k) => k.storageKey === "newsflash:filter-prefs")).toBe(true)
    expect(SYNCED_KEYS.some((k) => k.remoteKey === "filterprefs")).toBe(true)
  })

  it("syncs filter preferences to remote on first login", async () => {
    localStorage.setItem("newsflash:filter-prefs", JSON.stringify({ "heise-plus": false }))
    localStorage.setItem("newsflash:filter-prefs:updated_at", "2025-01-01T00:00:00.000Z")

    const { client, upsertMock } = createMockSupabase([])

    await performSync(client, "user-1")

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "filterprefs",
        data: { "heise-plus": false },
      }),
    )
  })

  it("pulls remote filter preferences when remote is newer", async () => {
    localStorage.setItem("newsflash:filter-prefs", JSON.stringify({}))
    localStorage.setItem("newsflash:filter-prefs:updated_at", "2025-01-01T00:00:00.000Z")

    const { client } = createMockSupabase([
      { key: "hidden", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "readlist", data: [], updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "feedprefs", data: {}, updated_at: "2025-06-01T00:00:00.000Z" },
      { key: "filterprefs", data: { "heise-plus": true }, updated_at: "2025-06-01T00:00:00.000Z" },
    ])

    await performSync(client, "user-1")

    expect(JSON.parse(localStorage.getItem("newsflash:filter-prefs") ?? "{}")).toEqual({
      "heise-plus": true,
    })
  })
})

describe("isSyncStale", () => {
  afterEach(() => {
    localStorage.clear()
  })

  it("returns true when no last-synced timestamp exists", () => {
    expect(isSyncStale()).toBe(true)
  })

  it("returns true when last sync was more than 5 minutes ago", () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString()
    localStorage.setItem("newsflash:last-synced", sixMinutesAgo)
    expect(isSyncStale()).toBe(true)
  })

  it("returns false when last sync was less than 5 minutes ago", () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    localStorage.setItem("newsflash:last-synced", twoMinutesAgo)
    expect(isSyncStale()).toBe(false)
  })
})
