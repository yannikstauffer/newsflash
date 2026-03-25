import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useThemePreference } from "./use-theme-preference"

type ChangeHandler = (event: MediaQueryListEvent) => void

function createMockMediaQueryList(prefersDark: boolean) {
  const listeners: ChangeHandler[] = []

  return {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_event: string, handler: ChangeHandler) => {
      listeners.push(handler)
    }),
    removeEventListener: vi.fn((_event: string, handler: ChangeHandler) => {
      const index = listeners.indexOf(handler)
      if (index >= 0) listeners.splice(index, 1)
    }),
    dispatchEvent: vi.fn(),
    _listeners: listeners,
    _simulateChange(dark: boolean) {
      for (const listener of listeners) {
        listener({ matches: dark } as MediaQueryListEvent)
      }
    },
  }
}

function mockMatchMedia(prefersDark: boolean) {
  const mockMql = createMockMediaQueryList(prefersDark)
  globalThis.matchMedia = vi.fn(() => mockMql) as unknown as typeof globalThis.matchMedia
  return mockMql
}

describe("useThemePreference", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
    mockMatchMedia(false)
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
    vi.restoreAllMocks()
  })

  describe("default behavior (system preference)", () => {
    it("defaults to system theme when no preference is stored", () => {
      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("system")
    })

    it("resolves to light when OS prefers light and no preference stored", () => {
      mockMatchMedia(false)
      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("system")
      expect(result.current.resolvedTheme).toBe("light")
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("resolves to dark when OS prefers dark and no preference stored", () => {
      mockMatchMedia(true)
      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("system")
      expect(result.current.resolvedTheme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })

  describe("explicit preferences", () => {
    it("uses saved light preference from localStorage over OS dark", () => {
      mockMatchMedia(true)
      localStorage.setItem("newsflash:theme", JSON.stringify("light"))

      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("light")
      expect(result.current.resolvedTheme).toBe("light")
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("restores dark theme from localStorage", () => {
      localStorage.setItem("newsflash:theme", JSON.stringify("dark"))

      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("dark")
      expect(result.current.resolvedTheme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("restores system preference from localStorage", () => {
      mockMatchMedia(true)
      localStorage.setItem("newsflash:theme", JSON.stringify("system"))

      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("system")
      expect(result.current.resolvedTheme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })

  describe("setTheme", () => {
    it("applies dark class when switching to dark theme", () => {
      const { result } = renderHook(() => useThemePreference())

      act(() => {
        result.current.setTheme("dark")
      })

      expect(result.current.theme).toBe("dark")
      expect(result.current.resolvedTheme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("removes dark class when switching to light theme", () => {
      localStorage.setItem("newsflash:theme", JSON.stringify("dark"))

      const { result } = renderHook(() => useThemePreference())
      expect(document.documentElement.classList.contains("dark")).toBe(true)

      act(() => {
        result.current.setTheme("light")
      })

      expect(result.current.theme).toBe("light")
      expect(result.current.resolvedTheme).toBe("light")
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("switches to system and resolves based on OS preference", () => {
      mockMatchMedia(true)
      localStorage.setItem("newsflash:theme", JSON.stringify("light"))

      const { result } = renderHook(() => useThemePreference())
      expect(result.current.resolvedTheme).toBe("light")

      act(() => {
        result.current.setTheme("system")
      })

      expect(result.current.theme).toBe("system")
      expect(result.current.resolvedTheme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })

  describe("toggleTheme", () => {
    it("toggles between light and dark", () => {
      localStorage.setItem("newsflash:theme", JSON.stringify("light"))
      const { result } = renderHook(() => useThemePreference())

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe("light")
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("toggles from system to dark when OS is light", () => {
      mockMatchMedia(false)
      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("system")
      expect(result.current.resolvedTheme).toBe("light")

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe("dark")
      expect(result.current.resolvedTheme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })

    it("toggles from system to light when OS is dark", () => {
      mockMatchMedia(true)
      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("system")
      expect(result.current.resolvedTheme).toBe("dark")

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe("light")
      expect(result.current.resolvedTheme).toBe("light")
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })
  })

  describe("matchMedia listener (system mode)", () => {
    it("attaches matchMedia listener when preference is system", () => {
      const mql = mockMatchMedia(false)
      renderHook(() => useThemePreference())

      expect(mql.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      )
    })

    it("attaches listener even when preference is explicit light", () => {
      const mql = mockMatchMedia(false)
      localStorage.setItem("newsflash:theme", JSON.stringify("light"))

      renderHook(() => useThemePreference())

      expect(mql.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      )
    })

    it("attaches listener even when preference is explicit dark", () => {
      const mql = mockMatchMedia(false)
      localStorage.setItem("newsflash:theme", JSON.stringify("dark"))

      renderHook(() => useThemePreference())

      expect(mql.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      )
    })

    it("reacts to OS theme change when in system mode", () => {
      const mql = mockMatchMedia(false)
      const { result } = renderHook(() => useThemePreference())

      expect(result.current.resolvedTheme).toBe("light")

      act(() => {
        mql._simulateChange(true)
      })

      expect(result.current.resolvedTheme).toBe("dark")
      expect(document.documentElement.classList.contains("dark")).toBe(true)

      act(() => {
        mql._simulateChange(false)
      })

      expect(result.current.resolvedTheme).toBe("light")
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })

    it("keeps listener active when switching from system to explicit", () => {
      const mql = mockMatchMedia(false)
      const { result } = renderHook(() => useThemePreference())

      expect(mql.addEventListener).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.setTheme("dark")
      })

      // Listener stays active to track OS changes for when user switches back to system
      expect(mql.removeEventListener).not.toHaveBeenCalled()
    })

    it("cleans up listener on unmount", () => {
      const mql = mockMatchMedia(false)
      const { unmount } = renderHook(() => useThemePreference())

      expect(mql.addEventListener).toHaveBeenCalledTimes(1)

      unmount()

      expect(mql.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      )
    })
  })

  describe("missing matchMedia", () => {
    it("does not throw and skips listener when matchMedia is unavailable", () => {
      // @ts-expect-error -- deliberately removing matchMedia to simulate non-DOM env
      delete globalThis.matchMedia

      const { result } = renderHook(() => useThemePreference())

      expect(result.current.theme).toBe("system")
      expect(result.current.resolvedTheme).toBe("light")
    })
  })

  describe("persistence", () => {
    it("persists preference to localStorage", () => {
      const { result } = renderHook(() => useThemePreference())

      act(() => {
        result.current.setTheme("dark")
      })

      expect(JSON.parse(localStorage.getItem("newsflash:theme") ?? "")).toBe(
        "dark",
      )
    })

    it("persists system preference to localStorage", () => {
      localStorage.setItem("newsflash:theme", JSON.stringify("light"))
      const { result } = renderHook(() => useThemePreference())

      act(() => {
        result.current.setTheme("system")
      })

      expect(JSON.parse(localStorage.getItem("newsflash:theme") ?? "")).toBe(
        "system",
      )
    })
  })
})
