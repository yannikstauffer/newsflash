import { useCallback, useEffect, useRef, useState } from "react"

const DEFAULT_BATCH_SIZE = 15

export function useLazyList<T>(
  items: T[],
  batchSize: number = DEFAULT_BATCH_SIZE,
): {
  visibleItems: T[]
  sentinelRef: React.RefCallback<HTMLDivElement>
} {
  const [state, setState] = useState<{
    items: T[]
    visibleCount: number
  }>({ items, visibleCount: batchSize })
  const observerRef = useRef<IntersectionObserver | undefined>(undefined)

  // Reset visible count when items reference changes (setState during render pattern)
  if (state.items !== items) {
    setState({ items, visibleCount: batchSize })
  }

  const visibleCount = state.visibleCount
  const allVisible = visibleCount >= items.length

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = undefined
      }

      // Don't observe if all items are visible or no node
      if (!node || allVisible) return

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setState((previous) => ({
              ...previous,
              visibleCount: previous.visibleCount + batchSize,
            }))
          }
        },
        { rootMargin: "200px" },
      )

      observer.observe(node)
      observerRef.current = observer
    },
    [allVisible, batchSize],
  )

  const visibleItems = items.slice(0, visibleCount)

  return { visibleItems, sentinelRef }
}
