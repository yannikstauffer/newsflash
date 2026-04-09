import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { registerPeriodicSync } from "./register-periodic-sync"

describe("registerPeriodicSync", () => {
  const mockRegister = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({
          periodicSync: { register: mockRegister },
        }),
      },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, "permissions", {
      value: {
        query: vi.fn().mockResolvedValue({ state: "granted" }),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("registers when API is available and permission is granted", async () => {
    await registerPeriodicSync()

    expect(mockRegister).toHaveBeenCalledWith("feed-refresh", {
      minInterval: 4 * 60 * 60 * 1000,
    })
  })

  it("skips when periodicSync API is unavailable", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({}),
      },
      writable: true,
      configurable: true,
    })

    await registerPeriodicSync()

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it("skips when permission is denied", async () => {
    Object.defineProperty(navigator, "permissions", {
      value: {
        query: vi.fn().mockResolvedValue({ state: "denied" }),
      },
      writable: true,
      configurable: true,
    })

    await registerPeriodicSync()

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it("skips when serviceWorker is not available", async () => {
    const original = navigator.serviceWorker
    Object.defineProperty(navigator, "serviceWorker", {
      value: undefined,
      writable: true,
      configurable: true,
    })

    await registerPeriodicSync()

    expect(mockRegister).not.toHaveBeenCalled()

    Object.defineProperty(navigator, "serviceWorker", {
      value: original,
      writable: true,
      configurable: true,
    })
  })
})
