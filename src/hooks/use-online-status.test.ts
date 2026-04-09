import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useOnlineStatus } from "./use-online-status"

describe("useOnlineStatus", () => {
  const originalOnLine = navigator.onLine
  let onlineListeners: Array<() => void>
  let offlineListeners: Array<() => void>

  beforeEach(() => {
    onlineListeners = []
    offlineListeners = []

    vi.spyOn(window, "addEventListener").mockImplementation(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        const callback = handler as () => void
        if (event === "online") onlineListeners.push(callback)
        if (event === "offline") offlineListeners.push(callback)
      },
    )

    vi.spyOn(window, "removeEventListener").mockImplementation(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        const callback = handler as () => void
        if (event === "online") {
          onlineListeners = onlineListeners.filter((l) => l !== callback)
        }
        if (event === "offline") {
          offlineListeners = offlineListeners.filter((l) => l !== callback)
        }
      },
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, "onLine", {
      value: originalOnLine,
      writable: true,
      configurable: true,
    })
  })

  it("returns true when online", () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it("returns false when offline", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it("updates to false when going offline", () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true })
      for (const listener of offlineListeners) listener()
    })

    expect(result.current).toBe(false)
  })

  it("updates to true when coming back online", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true, configurable: true })
      for (const listener of onlineListeners) listener()
    })

    expect(result.current).toBe(true)
  })

  it("cleans up event listeners on unmount", () => {
    const { unmount } = renderHook(() => useOnlineStatus())
    expect(onlineListeners).toHaveLength(1)
    expect(offlineListeners).toHaveLength(1)

    unmount()

    expect(onlineListeners).toHaveLength(0)
    expect(offlineListeners).toHaveLength(0)
  })
})
