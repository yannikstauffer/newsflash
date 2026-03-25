import { useCallback } from "react"

import { useLocalStorage } from "@/hooks/use-local-storage"

const STORAGE_KEY = "newsflash:filter-prefs"

export function useFilterPreferences(): {
  isFilterEnabled: (filterId: string, enabledByDefault: boolean) => boolean
  toggleFilter: (filterId: string, enabledByDefault: boolean) => void
} {
  const [store, setStore] = useLocalStorage<Record<string, boolean>>(STORAGE_KEY, {})

  const isFilterEnabled = useCallback(
    (filterId: string, enabledByDefault: boolean): boolean => {
      // eslint-disable-next-line security/detect-object-injection -- filterId is from our connector registry
      const stored = store[filterId]
      if (enabledByDefault) {
        return stored !== false
      }
      return stored === true
    },
    [store],
  )

  const toggleFilter = useCallback(
    (filterId: string, enabledByDefault: boolean) => {
      setStore((previous) => ({
        ...previous,
        [filterId]: !isFilterEnabled(filterId, enabledByDefault),
      }))
    },
    [setStore, isFilterEnabled],
  )

  return {
    isFilterEnabled,
    toggleFilter,
  }
}
