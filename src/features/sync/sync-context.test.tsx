import { act, render, renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SyncProvider, useSyncContext } from "./sync-context"

import type { ReactNode } from "react"

const mockPerformSync = vi.fn()
const mockIsSyncStale = vi.fn(() => true)

vi.mock("./sync-service", () => ({
  performSync: (...args: unknown[]) => mockPerformSync(...args),
  isSyncStale: () => mockIsSyncStale(),
}))

const mockGetSession = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSupabase = {
  auth: {
    getSession: mockGetSession,
    signOut: mockSignOut,
    onAuthStateChange: mockOnAuthStateChange,
  },
  from: vi.fn(),
}

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => Promise.resolve(mockSupabase),
}))

function wrapper({ children }: { readonly children: ReactNode }) {
  return <SyncProvider>{children}</SyncProvider>
}

describe("SyncProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockPerformSync.mockResolvedValue(undefined)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("starts unauthenticated with IDLE status", async () => {
    const { result } = renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
    })
    expect(result.current.syncStatus).toBe("IDLE")
    expect(result.current.userEmail).toBeNull()
  })

  it("detects authenticated session on mount", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })

    const { result } = renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    expect(result.current.userEmail).toBe("test@example.com")
  })

  it("auto-syncs on mount when authenticated and stale", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })
    mockIsSyncStale.mockReturnValue(true)

    renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(mockPerformSync).toHaveBeenCalled()
    })
  })

  it("skips auto-sync when authenticated but not stale", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })
    mockIsSyncStale.mockReturnValue(false)

    renderHook(() => useSyncContext(), { wrapper })

    // Wait for session check to complete
    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled()
    })

    // Give time for potential sync call
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(mockPerformSync).not.toHaveBeenCalled()
  })

  it("skips sync when unauthenticated", async () => {
    renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled()
    })

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(mockPerformSync).not.toHaveBeenCalled()
  })

  it("allows manual sync trigger", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })
    mockIsSyncStale.mockReturnValue(false)

    const { result } = renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    await act(async () => {
      result.current.triggerSync()
    })

    await waitFor(() => {
      expect(mockPerformSync).toHaveBeenCalled()
    })
  })

  it("signs out and clears auth state", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })
    mockSignOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.userEmail).toBeNull()
  })

  it("provides context to children", async () => {
    function TestChild() {
      const { isAuthenticated } = useSyncContext()
      return <div data-testid="auth">{String(isAuthenticated)}</div>
    }

    render(
      <SyncProvider>
        <TestChild />
      </SyncProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("false")
    })
  })
})
