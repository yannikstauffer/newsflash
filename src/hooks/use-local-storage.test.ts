import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useLocalStorage } from "./use-local-storage"

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default"),
    )

    expect(result.current[0]).toBe("default")
  })

  it("reads existing value from localStorage", () => {
    localStorage.setItem("test-key", JSON.stringify("stored"))

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default"),
    )

    expect(result.current[0]).toBe("stored")
  })

  it("writes value to localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default"),
    )

    act(() => {
      result.current[1]("updated")
    })

    expect(result.current[0]).toBe("updated")
    expect(JSON.parse(localStorage.getItem("test-key") ?? "")).toBe("updated")
  })

  it("supports functional updates", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0))

    act(() => {
      result.current[1]((previous) => previous + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it("handles object values", () => {
    const initial = { enabled: true, count: 0 }

    const { result } = renderHook(() =>
      useLocalStorage("test-key", initial),
    )

    act(() => {
      result.current[1]({ enabled: false, count: 5 })
    })

    expect(result.current[0]).toEqual({ enabled: false, count: 5 })
  })

  it("returns initial value when localStorage has invalid JSON", () => {
    localStorage.setItem("test-key", "not-json{{{")

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "fallback"),
    )

    expect(result.current[0]).toBe("fallback")
  })
})
