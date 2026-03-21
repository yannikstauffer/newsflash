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

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    return getOsTheme()
  }
  return preference
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

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme),
  )

  useEffect(() => {
    const resolved = resolveTheme(theme)
    // todo: have a look at this lint issue
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme(resolved)
    applyThemeClass(resolved)

    if (theme === "system") {
      const mediaQuery = globalThis.matchMedia(DARK_MEDIA_QUERY)
      const handleChange = (event: MediaQueryListEvent) => {
        const newResolved: ResolvedTheme = event.matches ? "dark" : "light"
        setResolvedTheme(newResolved)
        applyThemeClass(newResolved)
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    }

    return undefined
  }, [theme])

  const setTheme = useCallback(
    (value: ThemePreference) => {
      setThemeValue(value)
    },
    [setThemeValue],
  )

  const toggleTheme = useCallback(() => {
    setThemeValue((current) => (current === "light" ? "dark" : "light"))
  }, [setThemeValue])

  return { theme, resolvedTheme, setTheme, toggleTheme }
}
