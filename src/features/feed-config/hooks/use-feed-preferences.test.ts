import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useFeedPreferences } from "./use-feed-preferences"

import type { LanguagePreference } from "./use-feed-preferences"

const STORAGE_KEY = "newsflash:feed-prefs"

describe("useFeedPreferences", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe("language preference", () => {
    it("defaults to 'all' when no language is stored", () => {
      const { result } = renderHook(() => useFeedPreferences())

      expect(result.current.language).toBe("all")
    })

    it("reads stored language preference", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ _language: "de" }),
      )

      const { result } = renderHook(() => useFeedPreferences())

      expect(result.current.language).toBe("de")
    })

    it.each(["all", "de", "en"] as LanguagePreference[])(
      "setLanguage persists '%s' to localStorage",
      (lang) => {
        const { result } = renderHook(() => useFeedPreferences())

        act(() => {
          result.current.setLanguage(lang)
        })

        expect(result.current.language).toBe(lang)
        const stored = JSON.parse(
          localStorage.getItem(STORAGE_KEY) ?? "{}",
        )
        expect(stored._language).toBe(lang)
      },
    )

    it("preserves feed preferences when changing language", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ "heise-news": false, _language: "all" }),
      )

      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.setLanguage("en")
      })

      expect(result.current.language).toBe("en")
      expect(result.current.isFeedEnabled("heise-news")).toBe(false)
    })

    it("does not expose _language in preferences record", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ "heise-news": true, _language: "de" }),
      )

      const { result } = renderHook(() => useFeedPreferences())

      expect(result.current.preferences).not.toHaveProperty("_language")
      expect(result.current.preferences).toHaveProperty("heise-news")
    })
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

    it("setAllForSource preserves language preference", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ _language: "de" }),
      )

      const { result } = renderHook(() => useFeedPreferences())

      act(() => {
        result.current.setAllForSource(["heise-news"], false)
      })

      expect(result.current.language).toBe("de")
    })
  })
})
