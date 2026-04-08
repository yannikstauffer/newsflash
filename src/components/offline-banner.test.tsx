import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { OfflineBanner } from "./offline-banner"

vi.mock("@/hooks/use-online-status", () => ({
  useOnlineStatus: vi.fn(),
}))

import { useOnlineStatus } from "@/hooks/use-online-status"

const mockUseOnlineStatus = vi.mocked(useOnlineStatus)

describe("OfflineBanner", () => {
  const originalOnLine = navigator.onLine

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, "onLine", {
      value: originalOnLine,
      writable: true,
      configurable: true,
    })
  })

  it("renders nothing when online", () => {
    mockUseOnlineStatus.mockReturnValue(true)
    const { container } = render(<OfflineBanner />)
    expect(container.innerHTML).toBe("")
  })

  it("renders banner when offline", () => {
    mockUseOnlineStatus.mockReturnValue(false)
    render(<OfflineBanner />)
    expect(screen.getByRole("status")).toBeDefined()
    expect(screen.getByText("You're offline — showing cached content")).toBeDefined()
  })

  it("has correct ARIA role", () => {
    mockUseOnlineStatus.mockReturnValue(false)
    render(<OfflineBanner />)
    const banner = screen.getByRole("status")
    expect(banner).toBeDefined()
  })
})
