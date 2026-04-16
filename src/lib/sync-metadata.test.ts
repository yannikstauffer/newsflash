import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("idb", () => {
  const mockStore = new Map<string, { key: string; value: unknown }>()
  return {
    openDB: vi.fn().mockResolvedValue({
      put: vi.fn((_store: string, entry: { key: string; value: unknown }) => {
        mockStore.set(entry.key, entry)
        return Promise.resolve()
      }),
      get: vi.fn((_store: string, key: string) => {
        return Promise.resolve(mockStore.get(key))
      }),
    }),
    __mockStore: mockStore,
  }
})

const { __mockStore } = await import("idb") as unknown as {
  __mockStore: Map<string, { key: string; value: unknown }>
}

describe("sync-metadata localStorage mirror", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    __mockStore.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getLastSyncedAtSync", () => {
    it("returns null when localStorage has no value", async () => {
      const { getLastSyncedAtSync } = await import("./sync-metadata")
      expect(getLastSyncedAtSync()).toBeNull()
    })

    it("returns a Date when localStorage has a valid ISO string", async () => {
      const iso = "2026-04-09T10:00:00.000Z"
      localStorage.setItem("newsflash:last-synced-at", iso)

      const { getLastSyncedAtSync } = await import("./sync-metadata")
      const result = getLastSyncedAtSync()

      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toBe(iso)
    })

    it("returns null when localStorage has an unparseable value", async () => {
      localStorage.setItem("newsflash:last-synced-at", "not-a-date")

      const { getLastSyncedAtSync } = await import("./sync-metadata")
      expect(getLastSyncedAtSync()).toBeNull()
    })

    it("returns null when localStorage throws", async () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable")
      })

      const { getLastSyncedAtSync } = await import("./sync-metadata")
      expect(getLastSyncedAtSync()).toBeNull()

      getItemSpy.mockRestore()
    })
  })

  describe("setLastSyncedAt dual-write", () => {
    it("writes to both localStorage and IndexedDB", async () => {
      const { setLastSyncedAt } = await import("./sync-metadata")
      const timestamp = new Date("2026-04-09T10:00:00.000Z")

      await setLastSyncedAt(timestamp)

      expect(localStorage.getItem("newsflash:last-synced-at")).toBe(
        "2026-04-09T10:00:00.000Z",
      )
      expect(__mockStore.get("last-synced")).toEqual({
        key: "last-synced",
        value: "2026-04-09T10:00:00.000Z",
      })
    })

    it("still writes to IndexedDB when localStorage throws", async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage unavailable")
      })

      const { setLastSyncedAt } = await import("./sync-metadata")
      const timestamp = new Date("2026-04-09T10:00:00.000Z")

      await setLastSyncedAt(timestamp)

      expect(__mockStore.get("last-synced")).toEqual({
        key: "last-synced",
        value: "2026-04-09T10:00:00.000Z",
      })

      setItemSpy.mockRestore()
    })
  })
})
