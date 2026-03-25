import { useCallback, useEffect, useRef, useState } from "react"

import type { SetStateAction } from "react"

const LOCAL_STORAGE_SYNC_EVENT = "newsflash:local-storage-sync"

interface LocalStorageSyncDetail {
  key: string
}

function dispatchSyncEvent(key: string): void {
  globalThis.window?.dispatchEvent(
    new CustomEvent<LocalStorageSyncDetail>(LOCAL_STORAGE_SYNC_EVENT, {
      detail: { key },
    }),
  )
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetStateAction<T>) => void] {
  const initialValueRef = useRef(initialValue)

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = globalThis.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const valueRef = useRef(storedValue)

  useEffect(() => {
    valueRef.current = storedValue
  }, [storedValue])

  useEffect(() => {
    function handleSync(event: Event) {
      const detail = (event as CustomEvent<LocalStorageSyncDetail>).detail
      if (detail.key !== key) return

      try {
        const item = globalThis.localStorage.getItem(key)
        const parsed = item ? (JSON.parse(item) as T) : initialValueRef.current
        valueRef.current = parsed
        setStoredValue(parsed)
      } catch {
        // ignore parse errors
      }
    }

    globalThis.window?.addEventListener(LOCAL_STORAGE_SYNC_EVENT, handleSync)
    return () => {
      globalThis.window?.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, handleSync)
    }
  }, [key])

  const setValue = useCallback(
    (value: SetStateAction<T>) => {
      const valueToStore =
        typeof value === "function"
          ? (value as (previous: T) => T)(valueRef.current)
          : value
      if (valueToStore === valueRef.current) return
      valueRef.current = valueToStore
      try {
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {
        // localStorage full or unavailable
      }
      setStoredValue(valueToStore)
      dispatchSyncEvent(key)
    },
    [key],
  )

  return [storedValue, setValue]
}
