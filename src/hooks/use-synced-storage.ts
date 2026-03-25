import { useCallback } from "react"

import { useLocalStorage } from "./use-local-storage"

import type { SetStateAction } from "react"

function updateTimestamp(key: string): void {
  try {
    globalThis.localStorage.setItem(
      `${key}:updated_at`,
      new Date().toISOString(),
    )
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Wraps useLocalStorage and adds a companion `<key>:updated_at` timestamp
 * that is updated on every write. This timestamp is used by the sync engine
 * for last-write-wins conflict resolution.
 */
export function useSyncedStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetStateAction<T>) => void] {
  const [value, setValueRaw] = useLocalStorage<T>(key, initialValue)

  const setValue = useCallback(
    (newValue: SetStateAction<T>) => {
      setValueRaw(newValue)
      updateTimestamp(key)
    },
    [key, setValueRaw],
  )

  return [value, setValue]
}
