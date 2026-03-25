import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SyncNavIcon } from "./sync-nav-icon"

import type { SyncStatus } from "../sync-status"

let mockContextValue = {
  syncStatus: "IDLE" as SyncStatus,
  userEmail: null as string | null,
  isAuthenticated: false,
  triggerSync: vi.fn(),
  signOut: vi.fn(),
}

vi.mock("../sync-context", () => ({
  useSyncContext: () => mockContextValue,
}))

describe("SyncNavIcon", () => {
  it("shows settings icon when IDLE", () => {
    mockContextValue = { ...mockContextValue, syncStatus: "IDLE", isAuthenticated: true }
    const { container } = render(<SyncNavIcon className="size-4" />)

    // Settings icon from lucide-react renders as an SVG
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).not.toHaveClass("animate-spin")
  })

  it("shows spinner when SYNCING", () => {
    mockContextValue = { ...mockContextValue, syncStatus: "SYNCING", isAuthenticated: true }
    const { container } = render(<SyncNavIcon className="size-4" />)

    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass("animate-spin")
  })

  it("shows checkmark when SUCCESS", () => {
    mockContextValue = { ...mockContextValue, syncStatus: "SUCCESS", isAuthenticated: true }
    const { container } = render(<SyncNavIcon className="size-4" />)

    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).not.toHaveClass("animate-spin")
  })

  it("always shows settings icon when unauthenticated regardless of status", () => {
    mockContextValue = { ...mockContextValue, syncStatus: "SYNCING", isAuthenticated: false }
    const { container } = render(<SyncNavIcon className="size-4" />)

    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    // Should not show spinner for unauthenticated users
    expect(svg).not.toHaveClass("animate-spin")
  })

  it("shows settings icon when in ERROR state", () => {
    mockContextValue = { ...mockContextValue, syncStatus: "ERROR", isAuthenticated: true }
    const { container } = render(<SyncNavIcon className="size-4" />)

    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).not.toHaveClass("animate-spin")
  })

  it("passes className to the icon", () => {
    mockContextValue = { ...mockContextValue, syncStatus: "IDLE", isAuthenticated: false }
    const { container } = render(<SyncNavIcon className="size-4" />)

    const svg = container.querySelector("svg")
    expect(svg).toHaveClass("size-4")
  })
})
