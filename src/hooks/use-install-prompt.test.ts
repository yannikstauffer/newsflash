import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mockIsStandalone = vi.fn(() => false)

vi.mock("./use-is-standalone", () => ({
  useIsStandalone: () => mockIsStandalone(),
}))

import { useInstallPrompt } from "./use-install-prompt"

const STORAGE_KEY = "newsflash:install-dismissed"

describe("useInstallPrompt", () => {
  let beforeInstallListeners: Array<(event: Event) => void>

  beforeEach(() => {
    beforeInstallListeners = []
    localStorage.removeItem(STORAGE_KEY)
    mockIsStandalone.mockReturnValue(false)

    vi.spyOn(window, "addEventListener").mockImplementation(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        if (event === "beforeinstallprompt") {
          beforeInstallListeners.push(handler as (event: Event) => void)
        }
      },
    )

    vi.spyOn(window, "removeEventListener").mockImplementation(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        if (event === "beforeinstallprompt") {
          beforeInstallListeners = beforeInstallListeners.filter(
            (l) => l !== handler,
          )
        }
      },
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.removeItem(STORAGE_KEY)
  })

  it("captures beforeinstallprompt event and sets canInstall", () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(false)

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ outcome: "accepted" }),
    }

    act(() => {
      for (const listener of beforeInstallListeners) {
        listener(mockEvent as unknown as Event)
      }
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.canInstall).toBe(true)
  })

  it("triggerInstall calls prompt() on the deferred event", async () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ outcome: "accepted" }),
    }

    const { result } = renderHook(() => useInstallPrompt())

    act(() => {
      for (const listener of beforeInstallListeners) {
        listener(mockEvent as unknown as Event)
      }
    })

    await act(async () => {
      await result.current.triggerInstall()
    })

    expect(mockEvent.prompt).toHaveBeenCalled()
    expect(result.current.canInstall).toBe(false)
  })

  it("dismiss persists timestamp to localStorage", () => {
    const { result } = renderHook(() => useInstallPrompt())

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.isDismissed).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
  })

  it("respects 7-day cooldown — dismissed recently returns isDismissed true", () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isDismissed).toBe(true)
  })

  it("cooldown expired — isDismissed returns false", () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    localStorage.setItem(STORAGE_KEY, String(eightDaysAgo))
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isDismissed).toBe(false)
  })

  it("clears deferred event after dismissed — second triggerInstall is a no-op", async () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ outcome: "dismissed" }),
    }

    const { result } = renderHook(() => useInstallPrompt())

    act(() => {
      for (const listener of beforeInstallListeners) {
        listener(mockEvent as unknown as Event)
      }
    })

    expect(result.current.canInstall).toBe(true)

    await act(async () => {
      await result.current.triggerInstall()
    })

    expect(mockEvent.prompt).toHaveBeenCalledTimes(1)
    expect(result.current.canInstall).toBe(false)

    // Event is single-use — second call should be a no-op
    mockEvent.prompt.mockClear()
    await act(async () => {
      await result.current.triggerInstall()
    })

    expect(mockEvent.prompt).not.toHaveBeenCalled()
  })

  it("returns canInstall=false when standalone", () => {
    mockIsStandalone.mockReturnValue(true)

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ outcome: "accepted" }),
    }

    const { result } = renderHook(() => useInstallPrompt())

    act(() => {
      for (const listener of beforeInstallListeners) {
        listener(mockEvent as unknown as Event)
      }
    })

    expect(result.current.canInstall).toBe(false)
  })

  it("returns isIosSafari=false when standalone", () => {
    mockIsStandalone.mockReturnValue(true)
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isIosSafari).toBe(false)
  })
})
