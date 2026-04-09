import { useDrag } from "@use-gesture/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import type { RefObject } from "react"

interface UsePullToRefreshOptions {
  readonly onRefresh: () => void
  readonly isRefreshing: boolean
}

interface UsePullToRefreshResult {
  readonly containerRef: RefObject<HTMLDivElement | null>
  readonly pullOffset: number
  readonly isPulling: boolean
}

const PULL_THRESHOLD = 64
const PULL_MAX = 80
const DEAD_ZONE = 8

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false
  if (typeof window.matchMedia !== "function") return false
  return window.matchMedia("(pointer: coarse)").matches
}

export function usePullToRefresh({
  onRefresh,
  isRefreshing,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [rawPullOffset, setRawPullOffset] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const gestureStartedRef = useRef(false)
  const [isTouch] = useState(() =>
    typeof window === "undefined" ? false : isTouchDevice(),
  )

  const onRefreshRef = useRef(onRefresh)
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  const handleDrag = useCallback(
    ({
      movement: [, my],
      last,
      cancel,
    }: {
      movement: [number, number]
      last: boolean
      cancel: () => void
    }) => {
      if (!isTouch) return
      if (isRefreshing) {
        cancel()
        return
      }

      if (window.scrollY > 1) {
        cancel()
        setRawPullOffset(0)
        setIsPulling(false)
        gestureStartedRef.current = false
        return
      }

      if (!gestureStartedRef.current && my < DEAD_ZONE) {
        return
      }

      if (last) {
        if (my >= PULL_THRESHOLD) {
          if (navigator.onLine) {
            onRefreshRef.current()
          } else {
            toast("You're offline")
          }
        } else {
          setRawPullOffset(0)
        }
        setIsPulling(false)
        gestureStartedRef.current = false
        return
      }

      gestureStartedRef.current = true
      setIsPulling(true)
      setRawPullOffset(Math.min(my, PULL_MAX))
    },
    [isRefreshing, isTouch],
  )

  useDrag(handleDrag, {
    target: containerRef,
    axis: "y",
    filterTaps: true,
    pointer: { touch: true },
    enabled: isTouch,
  })

  // Derive effective pull offset: show offset while pulling or refreshing,
  // reset to 0 when refresh completes (isPulling=false, isRefreshing=false)
  const pullOffset = isPulling || isRefreshing ? rawPullOffset : 0

  return { containerRef, pullOffset, isPulling }
}
