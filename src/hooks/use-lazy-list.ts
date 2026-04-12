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

  // Update state when items reference changes (setState during render pattern)
  if (state.items !== items) {
    const previousLength = state.items.length
    const newLength = items.length
    const shouldPreserve = previousLength > 0 && newLength >= previousLength

    setState({
      items,
      visibleCount: shouldPreserve
        ? Math.min(state.visibleCount, newLength)
        : batchSize,
    })
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
