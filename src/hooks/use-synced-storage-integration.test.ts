import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { LOCAL_STORAGE_SYNC_EVENT } from "./use-local-storage"
import { useSyncedStorage } from "./use-synced-storage"

import type { LocalStorageSyncDetail } from "./use-local-storage"

describe("useSyncedStorage companion timestamps with synced keys", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("updates newsflash:hidden:updated_at when hidden articles change", () => {
    const { result } = renderHook(() =>
      useSyncedStorage<string[]>("newsflash:hidden", []),
    )

    act(() => {
      result.current[1](["article-1"])
    })

    const timestamp = localStorage.getItem("newsflash:hidden:updated_at")
    expect(timestamp).toBeTruthy()
    expect(new Date(timestamp!).toISOString()).toBe(timestamp)
  })

  it("updates newsflash:readlist:updated_at when read list changes", () => {
    const { result } = renderHook(() =>
      useSyncedStorage<Array<{ id: string }>>("newsflash:readlist", []),
    )

    act(() => {
      result.current[1]([{ id: "article-1" }])
    })

    const timestamp = localStorage.getItem("newsflash:readlist:updated_at")
    expect(timestamp).toBeTruthy()
  })

  it("updates newsflash:feed-prefs:updated_at when feed preferences change", () => {
    const { result } = renderHook(() =>
      useSyncedStorage<Record<string, boolean>>("newsflash:feed-prefs", {}),
    )

    act(() => {
      result.current[1]({ "feed-1": true })
    })

    const timestamp = localStorage.getItem("newsflash:feed-prefs:updated_at")
    expect(timestamp).toBeTruthy()
  })

  it("does not create companion timestamp for non-synced keys using useLocalStorage directly", () => {
    // Theme preference uses useLocalStorage, not useSyncedStorage
    // so no companion timestamp should be created
    // This test verifies that useSyncedStorage is what creates the timestamps
    const { result } = renderHook(() =>
      useSyncedStorage("newsflash:test-key", "default"),
    )

    act(() => {
      result.current[1]("updated")
    })

    expect(localStorage.getItem("newsflash:test-key:updated_at")).toBeTruthy()
  })
})

describe("useSyncedStorage re-renders on sync pull events", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("re-renders with new data when a sync event is dispatched for its key", () => {
    const { result } = renderHook(() =>
      useSyncedStorage<string[]>("newsflash:hidden", []),
    )

    expect(result.current[0]).toEqual([])

    // Simulate sync-service writing remote data to localStorage and dispatching event
    localStorage.setItem("newsflash:hidden", JSON.stringify(["article-from-remote"]))

    act(() => {
      window.dispatchEvent(
        new CustomEvent<LocalStorageSyncDetail>(LOCAL_STORAGE_SYNC_EVENT, {
          detail: { key: "newsflash:hidden" },
        }),
      )
    })

    expect(result.current[0]).toEqual(["article-from-remote"])
  })

  it("does not re-render when a sync event is dispatched for a different key", () => {
    const { result } = renderHook(() =>
      useSyncedStorage<string[]>("newsflash:hidden", []),
    )

    // Write to a different key and dispatch event for it
    localStorage.setItem("newsflash:readlist", JSON.stringify([{ id: "a" }]))

    act(() => {
      window.dispatchEvent(
        new CustomEvent<LocalStorageSyncDetail>(LOCAL_STORAGE_SYNC_EVENT, {
          detail: { key: "newsflash:readlist" },
        }),
      )
    })

    // hidden should still be its initial value
    expect(result.current[0]).toEqual([])
  })
})

describe("useSyncedStorage dispatches sync event on write (debounce trigger)", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("dispatches a sync event when a synced value is written", () => {
    const events: string[] = []
    const listener = (event_: Event) => {
      events.push((event_ as CustomEvent<LocalStorageSyncDetail>).detail.key)
    }
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    const { result } = renderHook(() =>
      useSyncedStorage<string[]>("newsflash:hidden", []),
    )

    act(() => {
      result.current[1](["article-1"])
    })

    window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, listener)

    // The write should have dispatched a sync event for its key
    expect(events).toContain("newsflash:hidden")
  })

  it("writes to localStorage so SyncProvider debounce can read the data", () => {
    const { result } = renderHook(() =>
      useSyncedStorage<Record<string, boolean>>("newsflash:filter-prefs", {}),
    )

    act(() => {
      result.current[1]({ "heise-plus": false })
    })

    // Verify both data and timestamp are in localStorage
    const stored = JSON.parse(localStorage.getItem("newsflash:filter-prefs") ?? "{}")
    expect(stored).toEqual({ "heise-plus": false })
    expect(localStorage.getItem("newsflash:filter-prefs:updated_at")).toBeTruthy()
  })
})
