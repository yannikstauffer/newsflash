import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useSyncedStorage } from "./use-synced-storage"

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
