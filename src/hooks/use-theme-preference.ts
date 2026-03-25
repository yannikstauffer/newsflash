import { useCallback, useEffect, useState } from "react"

import { useLocalStorage } from "./use-local-storage"

export type ThemePreference = "light" | "dark" | "system"

type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "newsflash:theme"

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)"

function getOsTheme(): ResolvedTheme {
  if (
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia(DARK_MEDIA_QUERY).matches
  ) {
    return "dark"
  }
  return "light"
}

function applyThemeClass(resolved: ResolvedTheme) {
  if (resolved === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

export function useThemePreference(): {
  readonly theme: ThemePreference
  readonly resolvedTheme: ResolvedTheme
  readonly setTheme: (theme: ThemePreference) => void
  readonly toggleTheme: () => void
} {
  const [theme, setThemeValue] = useLocalStorage<ThemePreference>(
    STORAGE_KEY,
    "system",
  )

  const [osTheme, setOsTheme] = useState<ResolvedTheme>(getOsTheme)

  useEffect(() => {
    if (typeof globalThis.matchMedia !== "function") return undefined

    const mediaQuery = globalThis.matchMedia(DARK_MEDIA_QUERY)
    const handleChange = (event: MediaQueryListEvent) => {
      setOsTheme(event.matches ? "dark" : "light")
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  const resolvedTheme: ResolvedTheme = theme === "system" ? osTheme : theme

  useEffect(() => {
    applyThemeClass(resolvedTheme)
  }, [resolvedTheme])

  const toggleTheme = useCallback(() => {
    setThemeValue((current) => {
      const resolved: ResolvedTheme = current === "system" ? osTheme : current
      return resolved === "light" ? "dark" : "light"
    })
  }, [setThemeValue, osTheme])

  return { theme, resolvedTheme, setTheme: setThemeValue, toggleTheme }
}
