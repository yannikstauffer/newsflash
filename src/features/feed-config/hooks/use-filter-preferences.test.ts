import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useFilterPreferences } from "./use-filter-preferences"

const STORAGE_KEY = "newsflash:filter-prefs"

describe("useFilterPreferences", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe("isFilterEnabled", () => {
    it("returns true for enabledByDefault: true when no preference stored", () => {
      const { result } = renderHook(() => useFilterPreferences())

      expect(result.current.isFilterEnabled("some-filter", true)).toBe(true)
    })

    it("returns false for enabledByDefault: false when no preference stored", () => {
      const { result } = renderHook(() => useFilterPreferences())

      expect(result.current.isFilterEnabled("some-filter", false)).toBe(false)
    })

    it("returns false for enabledByDefault: true when explicitly disabled", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ "my-filter": false }))

      const { result } = renderHook(() => useFilterPreferences())

      expect(result.current.isFilterEnabled("my-filter", true)).toBe(false)
    })

    it("returns true for enabledByDefault: false when explicitly enabled", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ "my-filter": true }))

      const { result } = renderHook(() => useFilterPreferences())

      expect(result.current.isFilterEnabled("my-filter", false)).toBe(true)
    })
  })

  describe("toggleFilter", () => {
    it("disables a filter that is enabled by default", () => {
      const { result } = renderHook(() => useFilterPreferences())

      act(() => {
        result.current.toggleFilter("my-filter", true)
      })

      expect(result.current.isFilterEnabled("my-filter", true)).toBe(false)
    })

    it("enables a filter that is disabled by default", () => {
      const { result } = renderHook(() => useFilterPreferences())

      act(() => {
        result.current.toggleFilter("my-filter", false)
      })

      expect(result.current.isFilterEnabled("my-filter", false)).toBe(true)
    })

    it("toggles back to default state", () => {
      const { result } = renderHook(() => useFilterPreferences())

      act(() => {
        result.current.toggleFilter("my-filter", true)
      })
      expect(result.current.isFilterEnabled("my-filter", true)).toBe(false)

      act(() => {
        result.current.toggleFilter("my-filter", true)
      })
      expect(result.current.isFilterEnabled("my-filter", true)).toBe(true)
    })
  })

  describe("persistence", () => {
    it("persists preferences to localStorage", () => {
      const { result } = renderHook(() => useFilterPreferences())

      act(() => {
        result.current.toggleFilter("heise-plus", false)
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
      expect(stored["heise-plus"]).toBe(true)
    })

    it("restores preferences from localStorage", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ "heise-plus": true, "heise-angebot": false }),
      )

      const { result } = renderHook(() => useFilterPreferences())

      expect(result.current.isFilterEnabled("heise-plus", false)).toBe(true)
      expect(result.current.isFilterEnabled("heise-angebot", true)).toBe(false)
    })

    it("writes companion updated_at timestamp on toggle (useSyncedStorage)", () => {
      const { result } = renderHook(() => useFilterPreferences())

      act(() => {
        result.current.toggleFilter("heise-plus", false)
      })

      const timestamp = localStorage.getItem(`${STORAGE_KEY}:updated_at`)
      expect(timestamp).toBeTruthy()
      expect(new Date(timestamp!).toISOString()).toBe(timestamp)
    })
  })
})
