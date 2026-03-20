import { useCallback } from "react"

import { useLocalStorage } from "@/hooks/use-local-storage"

const STORAGE_KEY = "newsflash:feed-prefs"
const LANGUAGE_FIELD = "_language"

export type LanguagePreference = "all" | "de" | "en"

interface FeedPrefsStore extends Record<string, boolean | LanguagePreference> {
  [LANGUAGE_FIELD]?: LanguagePreference
}

export function useFeedPreferences(): {
  preferences: Record<string, boolean>
  language: LanguagePreference
  isFeedEnabled: (feedId: string) => boolean
  toggleFeed: (feedId: string) => void
  setFeedEnabled: (feedId: string, enabled: boolean) => void
  setAllForSource: (feedIds: string[], enabled: boolean) => void
  setLanguage: (language: LanguagePreference) => void
} {
  const [store, setStore] = useLocalStorage<FeedPrefsStore>(STORAGE_KEY, {})

  // Extract language and feed preferences from the combined store
  const language: LanguagePreference =
    // eslint-disable-next-line security/detect-object-injection -- LANGUAGE_FIELD is a constant
    (store[LANGUAGE_FIELD] as LanguagePreference | undefined) ?? "all"
  const preferences: Record<string, boolean> = Object.fromEntries(
    Object.entries(store).filter(([key]) => key !== LANGUAGE_FIELD),
  ) as Record<string, boolean>

  const isFeedEnabled = useCallback(
    (feedId: string): boolean => {
      // eslint-disable-next-line security/detect-object-injection -- feedId is from our connector registry
      return store[feedId] !== false
    },
    [store],
  )

  const toggleFeed = useCallback(
    (feedId: string) => {
      setStore((previous) => ({
        ...previous,
        // eslint-disable-next-line security/detect-object-injection -- feedId is from our connector registry
        [feedId]: previous[feedId] === false,
      }))
    },
    [setStore],
  )

  const setFeedEnabled = useCallback(
    (feedId: string, enabled: boolean) => {
      setStore((previous) => ({
        ...previous,
        [feedId]: enabled,
      }))
    },
    [setStore],
  )

  const setAllForSource = useCallback(
    (feedIds: string[], enabled: boolean) => {
      setStore((previous) => {
        const updated = { ...previous }
        for (const feedId of feedIds) {
          // eslint-disable-next-line security/detect-object-injection -- feedId from connector registry
          updated[feedId] = enabled
        }
        return updated
      })
    },
    [setStore],
  )

  const setLanguage = useCallback(
    (newLanguage: LanguagePreference) => {
      setStore((previous) => ({
        ...previous,
        [LANGUAGE_FIELD]: newLanguage,
      }))
    },
    [setStore],
  )

  return {
    preferences,
    language,
    isFeedEnabled,
    toggleFeed,
    setFeedEnabled,
    setAllForSource,
    setLanguage,
  }
}
