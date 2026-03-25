import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useSyncedStorage } from "./use-synced-storage"

describe("useSyncedStorage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("delegates to useLocalStorage for reads", () => {
    localStorage.setItem("test-key", JSON.stringify("existing"))

    const { result } = renderHook(() => useSyncedStorage("test-key", "default"))

    expect(result.current[0]).toBe("existing")
  })

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useSyncedStorage("test-key", "default"))

    expect(result.current[0]).toBe("default")
  })

  it("writes value to localStorage", () => {
    const { result } = renderHook(() => useSyncedStorage("test-key", "default"))

    act(() => {
      result.current[1]("updated")
    })

    expect(result.current[0]).toBe("updated")
    expect(JSON.parse(localStorage.getItem("test-key") ?? "")).toBe("updated")
  })

  it("updates companion timestamp on write", () => {
    const { result } = renderHook(() => useSyncedStorage("test-key", "default"))

    expect(localStorage.getItem("test-key:updated_at")).toBeNull()

    act(() => {
      result.current[1]("updated")
    })

    const timestamp = localStorage.getItem("test-key:updated_at")
    expect(timestamp).toBeTruthy()
    // Verify it is a valid ISO timestamp
    expect(new Date(timestamp!).toISOString()).toBe(timestamp)
  })

  it("updates timestamp on each write", () => {
    const { result } = renderHook(() => useSyncedStorage<string[]>("test-key", []))

    act(() => {
      result.current[1](["first"])
    })

    const firstTimestamp = localStorage.getItem("test-key:updated_at")

    act(() => {
      result.current[1](["first", "second"])
    })

    const secondTimestamp = localStorage.getItem("test-key:updated_at")
    expect(secondTimestamp).toBeTruthy()
    expect(secondTimestamp! >= firstTimestamp!).toBe(true)
  })

  it("supports functional updates", () => {
    const { result } = renderHook(() => useSyncedStorage("test-key", 0))

    act(() => {
      result.current[1]((previous) => previous + 1)
    })

    expect(result.current[0]).toBe(1)
    expect(localStorage.getItem("test-key:updated_at")).toBeTruthy()
  })
})
