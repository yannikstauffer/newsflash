import { useCallback, useState } from "react"

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((previous: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = globalThis.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((previous: T) => T)) => {
      setStoredValue((current) => {
        const valueToStore =
          value instanceof Function ? value(current) : value
        try {
          globalThis.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch {
          // localStorage full or unavailable
        }
        return valueToStore
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
