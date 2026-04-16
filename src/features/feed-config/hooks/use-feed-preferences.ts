import { useCallback, useEffect, useRef } from "react"

import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { setFeedPreferences } from "@/lib/sync-metadata"

const STORAGE_KEY = "newsflash:feed-prefs"

export function useFeedPreferences(): {
  preferences: Record<string, boolean>
  isFeedEnabled: (feedId: string) => boolean
  toggleFeed: (feedId: string) => void
  setFeedEnabled: (feedId: string, enabled: boolean) => void
  setAllForSource: (feedIds: string[], enabled: boolean) => void
  enableAll: (feedIds: string[]) => void
  disableAll: (feedIds: string[]) => void
} {
  const [store, setStore] = useSyncedStorage<Record<string, boolean>>(STORAGE_KEY, {})

  const preferences: Record<string, boolean> = store

  const storeRef = useRef(store)
  useEffect(() => {
    storeRef.current = store
  }, [store])

  useEffect(() => {
    setFeedPreferences(store).catch(() => {})
  }, [store])

  const isFeedEnabled = useCallback((feedId: string): boolean => {
    // eslint-disable-next-line security/detect-object-injection -- feedId is from our connector registry
    return storeRef.current[feedId] !== false
  }, [])

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

  const enableAll = useCallback(
    (feedIds: string[]) => {
      setStore((previous) => {
        const updated = { ...previous }
        for (const feedId of feedIds) {
          // eslint-disable-next-line security/detect-object-injection -- feedId from connector registry
          updated[feedId] = true
        }
        return updated
      })
    },
    [setStore],
  )

  const disableAll = useCallback(
    (feedIds: string[]) => {
      setStore((previous) => {
        const updated = { ...previous }
        for (const feedId of feedIds) {
          // eslint-disable-next-line security/detect-object-injection -- feedId from connector registry
          updated[feedId] = false
        }
        return updated
      })
    },
    [setStore],
  )

  return {
    preferences,
    isFeedEnabled,
    toggleFeed,
    setFeedEnabled,
    setAllForSource,
    enableAll,
    disableAll,
  }
}
