import { useCallback } from "react"

import { useLocalStorage } from "@/hooks/use-local-storage"

const STORAGE_KEY = "newsflash:feed-prefs"

export function useFeedPreferences(): {
  preferences: Record<string, boolean>
  isFeedEnabled: (feedId: string) => boolean
  toggleFeed: (feedId: string) => void
  setFeedEnabled: (feedId: string, enabled: boolean) => void
  setAllForSource: (feedIds: string[], enabled: boolean) => void
} {
  const [preferences, setPreferences] = useLocalStorage<
    Record<string, boolean>
  >(STORAGE_KEY, {})

  const isFeedEnabled = useCallback(
    (feedId: string): boolean => {
      // eslint-disable-next-line security/detect-object-injection -- feedId is from our connector registry
      return preferences[feedId] !== false
    },
    [preferences],
  )

  const toggleFeed = useCallback(
    (feedId: string) => {
      setPreferences((previous) => ({
        ...previous,
        // eslint-disable-next-line security/detect-object-injection -- feedId is from our connector registry
        [feedId]: previous[feedId] === false,
      }))
    },
    [setPreferences],
  )

  const setFeedEnabled = useCallback(
    (feedId: string, enabled: boolean) => {
      setPreferences((previous) => ({
        ...previous,
        [feedId]: enabled,
      }))
    },
    [setPreferences],
  )

  const setAllForSource = useCallback(
    (feedIds: string[], enabled: boolean) => {
      setPreferences((previous) => {
        const updated = { ...previous }
        for (const feedId of feedIds) {
          // eslint-disable-next-line security/detect-object-injection -- feedId from connector registry
          updated[feedId] = enabled
        }
        return updated
      })
    },
    [setPreferences],
  )

  return { preferences, isFeedEnabled, toggleFeed, setFeedEnabled, setAllForSource }
}
