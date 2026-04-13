import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FeedStatusRow } from "./feed-status-row"

vi.mock("@/lib/sync-metadata", () => ({
  getLastSyncedAtSync: vi.fn(),
  getLastSyncedAt: vi.fn(),
}))

import { getLastSyncedAt, getLastSyncedAtSync } from "@/lib/sync-metadata"

const mockGetLastSyncedAtSync = vi.mocked(getLastSyncedAtSync)
const mockGetLastSyncedAt = vi.mocked(getLastSyncedAt)

describe("FeedStatusRow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-04-09T12:00:00Z"))
    mockGetLastSyncedAt.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("displays both timestamps when both are available", () => {
    mockGetLastSyncedAtSync.mockReturnValue(new Date("2026-04-09T10:00:00Z"))

    render(<FeedStatusRow lastRefreshedAt={new Date("2026-04-09T11:00:00Z")} />)

    const row = screen.getByLabelText("Feed status")
    expect(row.textContent).toContain("Refreshed")
    expect(row.textContent).toContain("Synced")
    expect(row.textContent).toContain("\u00B7")
  })

  it("displays only refresh timestamp when sync is null", () => {
    mockGetLastSyncedAtSync.mockReturnValue(null)

    render(<FeedStatusRow lastRefreshedAt={new Date("2026-04-09T11:00:00Z")} />)

    const row = screen.getByLabelText("Feed status")
    expect(row.textContent).toContain("Refreshed")
    expect(row.textContent).not.toContain("Synced")
    expect(row.textContent).not.toContain("\u00B7")
  })

  it("displays only sync timestamp when refresh is null", () => {
    mockGetLastSyncedAtSync.mockReturnValue(new Date("2026-04-09T10:00:00Z"))

    render(<FeedStatusRow lastRefreshedAt={null} />)

    const row = screen.getByLabelText("Feed status")
    expect(row.textContent).not.toContain("Refreshed")
    expect(row.textContent).toContain("Synced")
    expect(row.textContent).not.toContain("\u00B7")
  })

  it("renders empty container with minimum height when both are null", () => {
    mockGetLastSyncedAtSync.mockReturnValue(null)

    render(<FeedStatusRow lastRefreshedAt={null} />)

    const row = screen.getByLabelText("Feed status")
    expect(row.textContent).toBe("")
    expect(row.className).toContain("min-h-5")
  })

  it("always has min-h-5 class regardless of timestamp state", () => {
    mockGetLastSyncedAtSync.mockReturnValue(new Date("2026-04-09T10:00:00Z"))

    render(<FeedStatusRow lastRefreshedAt={new Date("2026-04-09T11:00:00Z")} />)

    const row = screen.getByLabelText("Feed status")
    expect(row.className).toContain("min-h-5")
  })

  it("falls back to IndexedDB when localStorage has no sync timestamp", async () => {
    mockGetLastSyncedAtSync.mockReturnValue(null)
    mockGetLastSyncedAt.mockResolvedValue(new Date("2026-04-09T09:00:00Z"))

    render(<FeedStatusRow lastRefreshedAt={new Date("2026-04-09T11:00:00Z")} />)

    // Initially no synced text (localStorage returned null)
    const row = screen.getByLabelText("Feed status")
    expect(row.textContent).not.toContain("Synced")

    // After IDB resolves, synced text should appear
    await act(async () => {})

    expect(row.textContent).toContain("Synced")
  })

  it("handles IndexedDB read failure gracefully", async () => {
    mockGetLastSyncedAtSync.mockReturnValue(null)
    mockGetLastSyncedAt.mockRejectedValue(new Error("IDB unavailable"))

    render(<FeedStatusRow lastRefreshedAt={new Date("2026-04-09T11:00:00Z")} />)

    await act(async () => {})

    const row = screen.getByLabelText("Feed status")
    expect(row.textContent).not.toContain("Synced")
    expect(row.textContent).toContain("Refreshed")
  })
})
