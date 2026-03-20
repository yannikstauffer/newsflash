import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useThemePreference } from "./use-theme-preference"

describe("useThemePreference", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  it("defaults to light theme when no preference is stored", () => {
    const { result } = renderHook(() => useThemePreference())

    expect(result.current.theme).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("restores dark theme from localStorage", () => {
    localStorage.setItem("newsflash:theme", JSON.stringify("dark"))

    const { result } = renderHook(() => useThemePreference())

    expect(result.current.theme).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("applies dark class when switching to dark theme", () => {
    const { result } = renderHook(() => useThemePreference())

    act(() => {
      result.current.setTheme("dark")
    })

    expect(result.current.theme).toBe("dark")
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
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("toggles between light and dark", () => {
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

  it("persists preference to localStorage", () => {
    const { result } = renderHook(() => useThemePreference())

    act(() => {
      result.current.setTheme("dark")
    })

    expect(JSON.parse(localStorage.getItem("newsflash:theme") ?? "")).toBe(
      "dark",
    )
  })
})
