import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { usePullToRefresh } from "./use-pull-to-refresh"

type DragHandler = (state: {
  movement: [number, number]
  last: boolean
  cancel: () => void
}) => void

let capturedDragHandler: DragHandler | undefined
let capturedDragOptions: Record<string, unknown> | undefined

vi.mock("@use-gesture/react", () => ({
  useDrag: (handler: DragHandler, options?: Record<string, unknown>) => {
    capturedDragHandler = handler
    capturedDragOptions = options
  },
}))

function mockMatchMedia(pointerCoarse: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(pointer: coarse)" ? pointerCoarse : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe("usePullToRefresh", () => {
  beforeEach(() => {
    capturedDragHandler = undefined
    capturedDragOptions = undefined
    Object.defineProperty(window, "scrollY", { value: 0, writable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("touch detection", () => {
    it("is a no-op on non-touch devices", () => {
      mockMatchMedia(false)
      const onRefresh = vi.fn()

      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      expect(result.current.pullOffset).toBe(0)
      expect(result.current.isPulling).toBe(false)

      // Drag handler should not trigger any state changes
      act(() => {
        capturedDragHandler!({
          movement: [0, 70],
          last: false,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(0)
      expect(onRefresh).not.toHaveBeenCalled()
    })

    it("activates on touch devices", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()

      renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      expect(capturedDragHandler).toBeDefined()
      expect(capturedDragOptions).toMatchObject({ axis: "y", filterTaps: true })
    })

    it("passes enabled: false when not a touch device", () => {
      mockMatchMedia(false)
      const onRefresh = vi.fn()

      renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      expect(capturedDragOptions).toMatchObject({ enabled: false })
    })

    it("passes enabled: true when on a touch device", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()

      renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      expect(capturedDragOptions).toMatchObject({ enabled: true })
    })
  })

  describe("pull behavior", () => {
    it("pull below threshold snaps back without calling onRefresh", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()

      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      act(() => {
        capturedDragHandler!({
          movement: [0, 30],
          last: false,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(30)
      expect(result.current.isPulling).toBe(true)

      act(() => {
        capturedDragHandler!({
          movement: [0, 30],
          last: true,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(0)
      expect(result.current.isPulling).toBe(false)
      expect(onRefresh).not.toHaveBeenCalled()
    })

    it("pull past threshold calls onRefresh", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()

      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      act(() => {
        capturedDragHandler!({
          movement: [0, 70],
          last: false,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(70)

      act(() => {
        capturedDragHandler!({
          movement: [0, 70],
          last: true,
          cancel: vi.fn(),
        })
      })

      expect(onRefresh).toHaveBeenCalledOnce()
    })

    it("dead zone only blocks before gesture starts, not mid-gesture", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()

      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      // Movement below dead zone — should be ignored
      act(() => {
        capturedDragHandler!({
          movement: [0, 5],
          last: false,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(0)
      expect(result.current.isPulling).toBe(false)

      // Movement past dead zone — gesture starts
      act(() => {
        capturedDragHandler!({
          movement: [0, 40],
          last: false,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(40)
      expect(result.current.isPulling).toBe(true)

      // Movement back below dead zone mid-gesture — should still update
      act(() => {
        capturedDragHandler!({
          movement: [0, 3],
          last: false,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(3)
      expect(result.current.isPulling).toBe(true)
    })

    it("caps pull offset at 80px", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()

      const { result } = renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      act(() => {
        capturedDragHandler!({
          movement: [0, 150],
          last: false,
          cancel: vi.fn(),
        })
      })

      expect(result.current.pullOffset).toBe(80)
    })
  })

  describe("scroll guard", () => {
    it("cancels gesture when not at scroll top", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()
      const cancel = vi.fn()

      renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: false }),
      )

      Object.defineProperty(window, "scrollY", { value: 100 })

      act(() => {
        capturedDragHandler!({
          movement: [0, 70],
          last: false,
          cancel,
        })
      })

      expect(cancel).toHaveBeenCalled()
    })
  })

  describe("refresh state", () => {
    it("ignores gesture while isRefreshing is true", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()
      const cancel = vi.fn()

      renderHook(() =>
        usePullToRefresh({ onRefresh, isRefreshing: true }),
      )

      act(() => {
        capturedDragHandler!({
          movement: [0, 70],
          last: false,
          cancel,
        })
      })

      expect(cancel).toHaveBeenCalled()
    })

    it("resets pull offset when isRefreshing transitions to false", () => {
      mockMatchMedia(true)
      const onRefresh = vi.fn()

      const { result, rerender } = renderHook(
        ({ isRefreshing }) =>
          usePullToRefresh({ onRefresh, isRefreshing }),
        { initialProps: { isRefreshing: false } },
      )

      // Simulate a pull that triggers refresh
      act(() => {
        capturedDragHandler!({
          movement: [0, 70],
          last: false,
          cancel: vi.fn(),
        })
      })

      act(() => {
        capturedDragHandler!({
          movement: [0, 70],
          last: true,
          cancel: vi.fn(),
        })
      })

      // While refreshing, pullOffset is preserved (derived from rawPullOffset + isRefreshing)
      rerender({ isRefreshing: true })
      expect(result.current.pullOffset).toBe(70)

      // When refresh completes, pullOffset derived to 0 (isPulling=false, isRefreshing=false)
      rerender({ isRefreshing: false })
      expect(result.current.pullOffset).toBe(0)
      expect(result.current.isPulling).toBe(false)
    })
  })
})
