import { useDrag } from "@use-gesture/react"
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"

import type { ReactNode } from "react"

interface SwipeConfig {
  readonly bgClassName: string
  readonly icon: ReactNode
  readonly onAction: () => void
}

interface SwipeableCardProps {
  readonly children: ReactNode
  readonly swipeRight?: SwipeConfig
  readonly swipeLeft?: SwipeConfig
}

export interface SwipeableCardHandle {
  triggerRemoval: (direction?: "left" | "right") => void
}

const SWIPE_THRESHOLD = 80
const ANIMATION_DURATION = 350
const REMOVAL_MAX_HEIGHT = "500px"

type AnimationState = "idle" | "dragging" | "removing"

export const SwipeableCard = forwardRef<SwipeableCardHandle, SwipeableCardProps>(
  function SwipeableCard({ children, swipeRight, swipeLeft }, ref) {
    const [offsetX, setOffsetX] = useState(0)
    const [animationState, setAnimationState] = useState<AnimationState>("idle")
    const [removalDirection, setRemovalDirection] = useState<"left" | "right" | null>(null)
    const [fadeOnly, setFadeOnly] = useState(false)
    const outerRef = useRef<HTMLDivElement>(null)
    const callbackFired = useRef(false)

    const fireCallback = useCallback(
      (direction: "left" | "right" | null) => {
        if (callbackFired.current) return
        callbackFired.current = true

        if (direction === "right" && swipeRight) {
          swipeRight.onAction()
        } else if (direction === "left" && swipeLeft) {
          swipeLeft.onAction()
        }
      },
      [swipeRight, swipeLeft],
    )

    const startRemoval = useCallback(
      (direction: "left" | "right" | null, fadeOnlyMode: boolean) => {
        setAnimationState("removing")
        setRemovalDirection(direction)
        setFadeOnly(fadeOnlyMode)
        callbackFired.current = false

        const fallbackTimer = setTimeout(() => {
          fireCallback(direction)
        }, ANIMATION_DURATION + 50)

        const element = outerRef.current
        if (element) {
          const handleTransitionEnd = (event: TransitionEvent) => {
            if (event.propertyName === "opacity") {
              clearTimeout(fallbackTimer)
              element.removeEventListener("transitionend", handleTransitionEnd)
              fireCallback(direction)
            }
          }
          element.addEventListener("transitionend", handleTransitionEnd)
        }
      },
      [fireCallback],
    )

    useImperativeHandle(
      ref,
      () => ({
        triggerRemoval(direction?: "left" | "right") {
          if (animationState === "removing") return
          startRemoval(direction ?? null, !direction)
        },
      }),
      [animationState, startRemoval],
    )

    const bind = useDrag(
      ({ movement: [mx], last, event }) => {
        if (animationState === "removing") return
        event.stopPropagation()

        if (last) {
          if (mx > SWIPE_THRESHOLD && swipeRight) {
            startRemoval("right", false)
          } else if (mx < -SWIPE_THRESHOLD && swipeLeft) {
            startRemoval("left", false)
          } else {
            setOffsetX(0)
            setAnimationState("idle")
          }
          return
        }

        setAnimationState("dragging")
        setOffsetX(mx)
      },
      {
        axis: "x",
        filterTaps: true,
      },
    )

    const isRemoving = animationState === "removing"

    const swipeDirection = offsetX > 0 ? "right" : (offsetX < 0 ? "left" : null)
    const effectiveDirection = swipeDirection ?? removalDirection

    function getActiveConfig(): SwipeConfig | undefined {
      if (effectiveDirection === "right") return swipeRight
      if (effectiveDirection === "left") return swipeLeft
      return undefined
    }

    const activeConfig = getActiveConfig()

    const showBackground = (animationState === "dragging" && offsetX !== 0 && activeConfig) || (isRemoving && activeConfig)

    function getCardTranslateX(): string {
      if (isRemoving && !fadeOnly) {
        return removalDirection === "right" ? "120%" : "-120%"
      }
      if (isRemoving && fadeOnly) {
        return "0px"
      }
      return `${offsetX}px`
    }

    const cardTransition =
      animationState === "dragging"
        ? "none"
        : `transform ${ANIMATION_DURATION}ms ease-out`

    const outerStyle: React.CSSProperties = isRemoving
      ? {
        maxHeight: "0px",
        opacity: 0,
        transition: `max-height ${ANIMATION_DURATION}ms ease-out, opacity ${ANIMATION_DURATION}ms ease-out`,
        overflow: "hidden",
      }
      : {
        maxHeight: REMOVAL_MAX_HEIGHT,
        opacity: 1,
        transition: `max-height ${ANIMATION_DURATION}ms ease-out, opacity ${ANIMATION_DURATION}ms ease-out`,
        overflow: "hidden",
      }

    return (
      <div
        ref={outerRef}
        style={outerStyle}
        data-testid="swipeable-card-outer"
        className="relative rounded-lg"
      >
        {showBackground && activeConfig && (
          <div
            className={`absolute inset-0 flex items-center rounded-lg ${swipeDirection === "right" || removalDirection === "right" ? "justify-start pl-6" : "justify-end pr-6"} ${activeConfig.bgClassName}`}
            data-testid="swipe-background"
            aria-hidden="true"
          >
            {activeConfig.icon}
          </div>
        )}

        <div
          {...bind()}
          className="relative touch-pan-y"
          style={{
            transform: `translateX(${getCardTranslateX()})`,
            transition: cardTransition,
          }}
          data-testid="swipeable-card-inner"
        >
          {children}
        </div>
      </div>
    )
  },
)
