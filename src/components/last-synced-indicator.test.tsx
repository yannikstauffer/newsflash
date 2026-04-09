import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LastSyncedIndicator } from "./last-synced-indicator"

import { getLastSyncedAt } from "@/lib/sync-metadata"

vi.mock("@/lib/sync-metadata", () => ({
  getLastSyncedAt: vi.fn(),
}))

const mockGetLastSyncedAt = vi.mocked(getLastSyncedAt)

describe("LastSyncedIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-04-09T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("displays relative time when timestamp exists", async () => {
    mockGetLastSyncedAt.mockResolvedValue(new Date("2026-04-09T10:00:00Z"))

    render(<LastSyncedIndicator />)
    await act(async () => {})

    const indicator = screen.getByLabelText("Last background sync")
    expect(indicator).toHaveTextContent("Synced 2h ago")
  })

  it("displays minutes for recent syncs", async () => {
    mockGetLastSyncedAt.mockResolvedValue(new Date("2026-04-09T11:45:00Z"))

    render(<LastSyncedIndicator />)
    await act(async () => {})

    const indicator = screen.getByLabelText("Last background sync")
    expect(indicator).toHaveTextContent("Synced 15m ago")
  })

  it("displays 'just now' for very recent syncs", async () => {
    mockGetLastSyncedAt.mockResolvedValue(new Date("2026-04-09T11:59:45Z"))

    render(<LastSyncedIndicator />)
    await act(async () => {})

    const indicator = screen.getByLabelText("Last background sync")
    expect(indicator).toHaveTextContent("Synced just now")
  })

  it("is hidden when no timestamp exists", async () => {
    mockGetLastSyncedAt.mockResolvedValue(null)

    const { container } = render(<LastSyncedIndicator />)
    await act(async () => {})

    expect(container.innerHTML).toBe("")
  })

  it("is hidden when IDB read fails", async () => {
    mockGetLastSyncedAt.mockRejectedValue(new Error("IDB unavailable"))

    const { container } = render(<LastSyncedIndicator />)
    await act(async () => {})

    expect(container.innerHTML).toBe("")
  })
})
