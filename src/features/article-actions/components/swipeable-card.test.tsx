import { render, screen, fireEvent, act } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

import { SwipeableCard } from "./swipeable-card"

import type { SwipeableCardHandle } from "./swipeable-card"

type DragCallback = (state: {
  movement: number[]
  last: boolean
  event: { stopPropagation: () => void }
}) => void

vi.mock("@use-gesture/react", () => ({
  useDrag: (handler: DragCallback) => {
    return () => ({
      onPointerDown: (event: PointerEvent) => {
        const element = event.currentTarget as HTMLElement
        element.dataset.dragHandler = "bound"
        element.dataset.handlerRef = "true"
        // Store handler reference for test access
        ;(element as unknown as Record<string, unknown>).__dragHandler = handler
      },
    })
  },
}))

function simulateDrag(
  element: HTMLElement,
  mx: number,
  last: boolean,
) {
  const handler = (element as unknown as Record<string, unknown>).__dragHandler as DragCallback
  if (!handler) return
  const event = { stopPropagation: vi.fn() }
  handler({ movement: [mx, 0], last, event })
}

const defaultSwipeRight = {
  bgClassName: "bg-amber-100 dark:bg-amber-900/30",
  icon: <span data-testid="right-icon">R</span>,
  onAction: vi.fn(),
}

const defaultSwipeLeft = {
  bgClassName: "bg-blue-100 dark:bg-blue-900/30",
  icon: <span data-testid="left-icon">L</span>,
  onAction: vi.fn(),
}

describe("SwipeableCard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe("background reveal", () => {
    it("does not show background when card is at rest", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      expect(screen.queryByTestId("swipe-background")).toBeNull()
    })

    it("shows background during drag", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      // Trigger pointer down to bind handler
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      // Simulate drag
      act(() => {
        simulateDrag(inner, 50, false)
      })

      expect(screen.getByTestId("swipe-background")).toBeDefined()
    })

    it("renders right swipe background with correct class when swiping right", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 50, false)
      })

      const background = screen.getByTestId("swipe-background")
      expect(background.className).toContain("bg-amber-100")
      expect(screen.getByTestId("right-icon")).toBeDefined()
    })

    it("renders left swipe background with correct class when swiping left", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, -50, false)
      })

      const background = screen.getByTestId("swipe-background")
      expect(background.className).toContain("bg-blue-100")
      expect(screen.getByTestId("left-icon")).toBeDefined()
    })

    it("marks background as aria-hidden", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 50, false)
      })

      expect(screen.getByTestId("swipe-background").getAttribute("aria-hidden")).toBe("true")
    })
  })

  describe("animation state transitions", () => {
    it("sets translateX during drag (no transition)", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 100, false)
      })

      expect(inner.style.transform).toBe("translateX(100px)")
      expect(inner.style.transition).toBe("none")
    })

    it("snaps back when released below threshold", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 30, false)
      })
      act(() => {
        simulateDrag(inner, 30, true)
      })

      expect(inner.style.transform).toBe("translateX(0px)")
    })

    it("enters removing state and translates to 120% when swiped right past threshold", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 100, false)
      })
      act(() => {
        simulateDrag(inner, 100, true)
      })

      expect(inner.style.transform).toBe("translateX(120%)")
    })

    it("enters removing state and translates to -120% when swiped left past threshold", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, -100, false)
      })
      act(() => {
        simulateDrag(inner, -100, true)
      })

      expect(inner.style.transform).toBe("translateX(-120%)")
    })

    it("does not collapse outer immediately on removal (staggered)", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      const outer = screen.getByTestId("swipeable-card-outer")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 100, false)
      })
      act(() => {
        simulateDrag(inner, 100, true)
      })

      // Outer should NOT have collapsed yet (100ms delay)
      expect(outer.style.maxHeight).toBe("500px")
      expect(outer.style.opacity).toBe("1")
    })

    it("collapses outer after 100ms stagger delay", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      const outer = screen.getByTestId("swipeable-card-outer")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 100, false)
      })
      act(() => {
        simulateDrag(inner, 100, true)
      })

      // Advance past the 100ms collapse delay
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(outer.style.maxHeight).toBe("0px")
      expect(outer.style.opacity).toBe("0")
    })

    it("fades card inner to opacity 0 during removal", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 100, false)
      })
      act(() => {
        simulateDrag(inner, 100, true)
      })

      expect(inner.style.opacity).toBe("0")
    })
  })

  describe("callback timing", () => {
    it("fires onAction via setTimeout fallback after animation duration", () => {
      const onAction = vi.fn()
      render(
        <SwipeableCard
          swipeRight={{ ...defaultSwipeRight, onAction }}
          swipeLeft={defaultSwipeLeft}
        >
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 100, false)
      })
      act(() => {
        simulateDrag(inner, 100, true)
      })

      expect(onAction).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(400)
      })

      expect(onAction).toHaveBeenCalledOnce()
    })

    it("fires left action when swiped left past threshold", () => {
      const onAction = vi.fn()
      render(
        <SwipeableCard
          swipeRight={defaultSwipeRight}
          swipeLeft={{ ...defaultSwipeLeft, onAction }}
        >
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, -100, false)
      })
      act(() => {
        simulateDrag(inner, -100, true)
      })

      act(() => {
        vi.advanceTimersByTime(400)
      })

      expect(onAction).toHaveBeenCalledOnce()
    })

    it("does not fire callback when swipe is below threshold", () => {
      const onAction = vi.fn()
      render(
        <SwipeableCard
          swipeRight={{ ...defaultSwipeRight, onAction }}
          swipeLeft={defaultSwipeLeft}
        >
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, 30, false)
      })
      act(() => {
        simulateDrag(inner, 30, true)
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(onAction).not.toHaveBeenCalled()
    })
  })

  describe("imperative handle", () => {
    it("triggerRemoval without direction triggers fade-only (no translateX)", () => {
      const ref = createRef<SwipeableCardHandle>()
      render(
        <SwipeableCard ref={ref} swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      act(() => {
        ref.current?.triggerRemoval()
      })

      const inner = screen.getByTestId("swipeable-card-inner")
      expect(inner.style.transform).toBe("translateX(0px)")
      expect(inner.style.opacity).toBe("0")

      // Outer collapses after 100ms stagger delay
      const outer = screen.getByTestId("swipeable-card-outer")
      expect(outer.style.opacity).toBe("1")

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(outer.style.opacity).toBe("0")
    })

    it("triggerRemoval with direction triggers slide removal", () => {
      const ref = createRef<SwipeableCardHandle>()
      render(
        <SwipeableCard ref={ref} swipeRight={defaultSwipeRight} swipeLeft={defaultSwipeLeft}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      act(() => {
        ref.current?.triggerRemoval("right")
      })

      const inner = screen.getByTestId("swipeable-card-inner")
      expect(inner.style.transform).toBe("translateX(120%)")
    })

    it("ignores subsequent triggerRemoval calls while removing", () => {
      const onAction = vi.fn()
      const ref = createRef<SwipeableCardHandle>()
      render(
        <SwipeableCard
          ref={ref}
          swipeRight={{ ...defaultSwipeRight, onAction }}
          swipeLeft={defaultSwipeLeft}
        >
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      act(() => {
        ref.current?.triggerRemoval("right")
      })
      act(() => {
        ref.current?.triggerRemoval("left")
      })

      act(() => {
        vi.advanceTimersByTime(400)
      })

      expect(onAction).toHaveBeenCalledOnce()
    })
  })

  describe("touch-pan-y class", () => {
    it("applies touch-pan-y class to inner element for vertical scroll compatibility", () => {
      render(
        <SwipeableCard swipeRight={defaultSwipeRight}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      expect(inner.className).toContain("touch-pan-y")
    })
  })

  describe("disabled directions", () => {
    it("does not trigger action when swiping in a disabled direction", () => {
      const onAction = vi.fn()
      render(
        <SwipeableCard swipeRight={{ ...defaultSwipeRight, onAction }}>
          <div>{"Content"}</div>
        </SwipeableCard>,
      )

      const inner = screen.getByTestId("swipeable-card-inner")
      fireEvent.pointerDown(inner, { clientX: 0, clientY: 0 })
      act(() => {
        simulateDrag(inner, -100, false)
      })
      act(() => {
        simulateDrag(inner, -100, true)
      })

      // Should snap back, not remove
      expect(inner.style.transform).toBe("translateX(0px)")

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(onAction).not.toHaveBeenCalled()
    })
  })
})
