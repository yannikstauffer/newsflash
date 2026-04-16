import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useFeedPreferences } from "./use-feed-preferences"

const STORAGE_KEY = "newsflash:feed-prefs"

describe("useFeedPreferences", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe("feed preferences", () => {
    it("treats missing feeds as enabled by default", () => {
      const { result } = renderHook(() => useFeedPreferences())

      expect(result.current.isFeedEnabled("some-feed")).toBe(true)
    })

    it("toggles a feed from enabled to disabled", () => {
      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.toggleFeed("heise-news")
      })

      expect(result.current.isFeedEnabled("heise-news")).toBe(false)
    })

    it("toggles a feed from disabled to enabled", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ "heise-news": false }),
      )

      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.toggleFeed("heise-news")
      })

      expect(result.current.isFeedEnabled("heise-news")).toBe(true)
    })

    it("setAllForSource enables multiple feeds", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ "srf-news": false, "srf-sport": false }),
      )

      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.setAllForSource(["srf-news", "srf-sport"], true)
      })

      expect(result.current.isFeedEnabled("srf-news")).toBe(true)
      expect(result.current.isFeedEnabled("srf-sport")).toBe(true)
    })

    it("setAllForSource disables multiple feeds", () => {
      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.setAllForSource(["srf-news", "srf-sport"], false)
      })

      expect(result.current.isFeedEnabled("srf-news")).toBe(false)
      expect(result.current.isFeedEnabled("srf-sport")).toBe(false)
    })

    it("enableAll enables all provided feed IDs", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ "srf-news": false, "heise-news": false, "digitec-news": false }),
      )

      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.enableAll(["srf-news", "heise-news", "digitec-news"])
      })

      expect(result.current.isFeedEnabled("srf-news")).toBe(true)
      expect(result.current.isFeedEnabled("heise-news")).toBe(true)
      expect(result.current.isFeedEnabled("digitec-news")).toBe(true)
    })

    it("maintains a stable isFeedEnabled reference across store updates", () => {
      const { result, rerender } = renderHook(() => useFeedPreferences())

      const firstReference = result.current.isFeedEnabled

      act(() => {
        result.current.toggleFeed("heise-news")
      })
      rerender()

      expect(result.current.isFeedEnabled).toBe(firstReference)
      // And it still reflects the updated store
      expect(result.current.isFeedEnabled("heise-news")).toBe(false)
    })

    it("disableAll disables all provided feed IDs", () => {
      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.disableAll(["srf-news", "heise-news", "digitec-news"])
      })

      expect(result.current.isFeedEnabled("srf-news")).toBe(false)
      expect(result.current.isFeedEnabled("heise-news")).toBe(false)
      expect(result.current.isFeedEnabled("digitec-news")).toBe(false)
    })
  })
})
