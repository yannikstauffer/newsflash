import { useDrag } from "@use-gesture/react"
import { useCallback, useRef, useState } from "react"

import type { ReactNode } from "react"

interface SwipeableCardProps {
  readonly children: ReactNode
  readonly onSwipeRight: () => void
  readonly onSwipeLeft: () => void
}

const SWIPE_THRESHOLD = 80

export function SwipeableCard({
  children,
  onSwipeRight,
  onSwipeLeft,
}: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSwipeRight = useCallback(() => {
    onSwipeRight()
  }, [onSwipeRight])

  const handleSwipeLeft = useCallback(() => {
    onSwipeLeft()
  }, [onSwipeLeft])

  const bind = useDrag(
    ({ movement: [mx], last, event }) => {
      event.stopPropagation()

      if (last) {
        if (mx > SWIPE_THRESHOLD) {
          handleSwipeRight()
        } else if (mx < -SWIPE_THRESHOLD) {
          handleSwipeLeft()
        }
        setOffsetX(0)
        return
      }

      setOffsetX(mx)
    },
    {
      axis: "x",
      filterTaps: true,
    },
  )

  return (
    <div
      ref={containerRef}
      {...bind()}
      className="touch-pan-y"
      style={{
        transform: `translateX(${offsetX}px)`,
        transition: offsetX === 0 ? "transform 0.2s ease-out" : "none",
      }}
    >
      {children}
    </div>
  )
}
