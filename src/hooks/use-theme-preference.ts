import { useCallback, useEffect } from "react"

import { useLocalStorage } from "./use-local-storage"

type ThemePreference = "light" | "dark"

const STORAGE_KEY = "newsflash:theme"

export function useThemePreference(): {
  readonly theme: ThemePreference
  readonly setTheme: (theme: ThemePreference) => void
  readonly toggleTheme: () => void
} {
  const [theme, setThemeValue] = useLocalStorage<ThemePreference>(
    STORAGE_KEY,
    "light",
  )

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
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

  return { theme, setTheme, toggleTheme }
}
