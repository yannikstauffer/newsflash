import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useIsStandalone } from "./use-is-standalone"

describe("useIsStandalone", () => {
  let changeListeners: Array<() => void>
  let mockMatches: boolean

  beforeEach(() => {
    changeListeners = []
    mockMatches = false

    // JSDOM doesn't implement matchMedia — define a stub so spyOn can attach
    if (!window.matchMedia) {
      window.matchMedia = (() => ({})) as typeof window.matchMedia
    }

    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === "(display-mode: standalone)" ? mockMatches : false,
          media: query,
          addEventListener: (_event: string, handler: () => void) => {
            changeListeners.push(handler)
          },
          removeEventListener: (_event: string, handler: () => void) => {
            changeListeners = changeListeners.filter((l) => l !== handler)
          },
        }) as unknown as MediaQueryList,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    const nav = navigator as Navigator & { standalone?: boolean }
    delete nav.standalone
  })

  it("returns true when standalone via media query", () => {
    mockMatches = true
    const { result } = renderHook(() => useIsStandalone())
    expect(result.current).toBe(true)
  })

  it("returns true when standalone via navigator.standalone (iOS)", () => {
    mockMatches = false
    Object.defineProperty(navigator, "standalone", {
      value: true,
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useIsStandalone())
    expect(result.current).toBe(true)
  })

  it("returns false in a browser tab", () => {
    mockMatches = false
    const { result } = renderHook(() => useIsStandalone())
    expect(result.current).toBe(false)
  })

  it("updates reactively when display mode changes", () => {
    mockMatches = false
    const { result } = renderHook(() => useIsStandalone())
    expect(result.current).toBe(false)

    act(() => {
      mockMatches = true
      for (const listener of changeListeners) listener()
    })

    expect(result.current).toBe(true)
  })

  it("cleans up event listeners on unmount", () => {
    const { unmount } = renderHook(() => useIsStandalone())
    expect(changeListeners).toHaveLength(1)

    unmount()

    expect(changeListeners).toHaveLength(0)
  })
})
