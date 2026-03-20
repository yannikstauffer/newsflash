import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useLazyList } from "./use-lazy-list"

function makeItems(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `item-${index}`)
}

describe("useLazyList", () => {
  let mockObserve: ReturnType<typeof vi.fn>
  let mockDisconnect: ReturnType<typeof vi.fn>
  let intersectionCallback: IntersectionObserverCallback

  beforeEach(() => {
    mockObserve = vi.fn()
    mockDisconnect = vi.fn()

    vi.stubGlobal(
      "IntersectionObserver",
      class MockIntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback
        }
        observe = mockObserve
        disconnect = mockDisconnect
        unobserve = vi.fn()
      },
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns only the first batch of items initially", () => {
    const items = makeItems(30)
    const { result } = renderHook(() => useLazyList(items, 15))

    expect(result.current.visibleItems).toHaveLength(15)
    expect(result.current.visibleItems[0]).toBe("item-0")
    expect(result.current.visibleItems[14]).toBe("item-14")
  })

  it("returns all items when total is less than batch size", () => {
    const items = makeItems(5)
    const { result } = renderHook(() => useLazyList(items, 15))

    expect(result.current.visibleItems).toHaveLength(5)
  })

  it("expands visible items when sentinel intersects", () => {
    const items = makeItems(30)
    const { result } = renderHook(() => useLazyList(items, 10))

    // Simulate attaching sentinel ref
    const sentinel = document.createElement("div")
    act(() => {
      result.current.sentinelRef(sentinel)
    })

    expect(mockObserve).toHaveBeenCalledWith(sentinel)

    // Simulate intersection
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(result.current.visibleItems).toHaveLength(20)

    // Another intersection
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(result.current.visibleItems).toHaveLength(30)
  })

  it("resets visible count when items reference changes", () => {
    const initialItems = makeItems(30)
    const { result, rerender } = renderHook(
      ({ items }) => useLazyList(items, 10),
      { initialProps: { items: initialItems } },
    )

    // Expand to 20
    const sentinel = document.createElement("div")
    act(() => {
      result.current.sentinelRef(sentinel)
    })
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(result.current.visibleItems).toHaveLength(20)

    // Change items — should reset
    const newItems = makeItems(25)
    rerender({ items: newItems })

    expect(result.current.visibleItems).toHaveLength(10)
  })

  it("does not observe sentinel when all items are visible", () => {
    const items = makeItems(5)
    const { result } = renderHook(() => useLazyList(items, 15))

    const sentinel = document.createElement("div")
    act(() => {
      result.current.sentinelRef(sentinel)
    })

    // Should not observe since all 5 items fit in one batch of 15
    expect(mockObserve).not.toHaveBeenCalled()
  })

  it("does not expand beyond total items", () => {
    const items = makeItems(12)
    const { result } = renderHook(() => useLazyList(items, 10))

    const sentinel = document.createElement("div")
    act(() => {
      result.current.sentinelRef(sentinel)
    })

    // First intersection brings to 20, but only 12 items exist
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(result.current.visibleItems).toHaveLength(12)
  })

  it("ignores non-intersecting entries", () => {
    const items = makeItems(30)
    const { result } = renderHook(() => useLazyList(items, 10))

    const sentinel = document.createElement("div")
    act(() => {
      result.current.sentinelRef(sentinel)
    })

    act(() => {
      intersectionCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(result.current.visibleItems).toHaveLength(10)
  })

  it("uses default batch size of 15", () => {
    const items = makeItems(30)
    const { result } = renderHook(() => useLazyList(items))

    expect(result.current.visibleItems).toHaveLength(15)
  })

  it("returns empty array when items array is empty", () => {
    const { result } = renderHook(() => useLazyList([], 10))

    expect(result.current.visibleItems).toHaveLength(0)
    expect(result.current.visibleItems).toEqual([])
  })

  it("shows exactly 1 item initially with batch size of 1 and adds 1 per intersection", () => {
    const items = makeItems(3)
    const { result } = renderHook(() => useLazyList(items, 1))

    expect(result.current.visibleItems).toHaveLength(1)
    expect(result.current.visibleItems[0]).toBe("item-0")

    // Attach sentinel and trigger intersection
    const sentinel = document.createElement("div")
    act(() => {
      result.current.sentinelRef(sentinel)
    })

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(result.current.visibleItems).toHaveLength(2)
    expect(result.current.visibleItems[1]).toBe("item-1")

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(result.current.visibleItems).toHaveLength(3)
  })

  it("does not create IntersectionObserver when sentinel receives null", () => {
    const items = makeItems(30)
    const { result } = renderHook(() => useLazyList(items, 10))

    // Pass null to sentinelRef — should not throw or create observer
    act(() => {
      result.current.sentinelRef(null)
    })

    expect(mockObserve).not.toHaveBeenCalled()
  })
})
