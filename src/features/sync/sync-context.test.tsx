import { act, render, renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SyncProvider, useSyncContext } from "./sync-context"

import type { LocalStorageSyncDetail } from "@/hooks/use-local-storage"
import type { ReactNode } from "react"

const LOCAL_STORAGE_SYNC_EVENT = "newsflash:local-storage-sync"

const mockPerformSync = vi.fn()

vi.mock("./sync-service", () => ({
  performSync: (...args: unknown[]) => mockPerformSync(...args),
  SYNCED_KEYS: [
    { storageKey: "newsflash:hidden", remoteKey: "hidden" },
    { storageKey: "newsflash:readlist", remoteKey: "readlist" },
    { storageKey: "newsflash:feed-prefs", remoteKey: "feedprefs" },
    { storageKey: "newsflash:filter-prefs", remoteKey: "filterprefs" },
  ],
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

  it("auto-syncs on mount when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })

    renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(mockPerformSync).toHaveBeenCalled()
    })
  })

  it("always syncs on mount regardless of last-synced timestamp", async () => {
    // Set a very recent last-synced timestamp (would have been "not stale" before)
    localStorage.setItem("newsflash:last-synced", new Date().toISOString())

    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })

    renderHook(() => useSyncContext(), { wrapper })

    await waitFor(() => {
      expect(mockPerformSync).toHaveBeenCalled()
    })
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

function dispatchSyncKeyEvent(key: string): void {
  window.dispatchEvent(
    new CustomEvent<LocalStorageSyncDetail>(LOCAL_STORAGE_SYNC_EVENT, {
      detail: { key },
    }),
  )
}

describe("SyncProvider debounced sync-on-write", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@example.com" } } },
    })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockPerformSync.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it("triggers delayed sync after a synced key write", async () => {
    renderHook(() => useSyncContext(), { wrapper })

    // Wait for mount sync to complete
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    mockPerformSync.mockClear()

    // Dispatch a synced key change event
    act(() => {
      dispatchSyncKeyEvent("newsflash:hidden")
    })

    // Should not have synced yet (within debounce window)
    expect(mockPerformSync).not.toHaveBeenCalled()

    // Advance past the 5-second debounce
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(mockPerformSync).toHaveBeenCalledTimes(1)
  })

  it("collapses rapid writes into a single sync", async () => {
    renderHook(() => useSyncContext(), { wrapper })

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    mockPerformSync.mockClear()

    // Dispatch multiple rapid synced key changes
    act(() => {
      dispatchSyncKeyEvent("newsflash:hidden")
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    act(() => {
      dispatchSyncKeyEvent("newsflash:hidden")
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    act(() => {
      dispatchSyncKeyEvent("newsflash:readlist")
    })

    // Still within debounce window — no sync yet
    expect(mockPerformSync).not.toHaveBeenCalled()

    // Advance past the debounce from the last event
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    // Only one sync should have fired
    expect(mockPerformSync).toHaveBeenCalledTimes(1)
  })

  it("skips debounced sync when not authenticated", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    renderHook(() => useSyncContext(), { wrapper })

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    mockPerformSync.mockClear()

    // Dispatch a synced key change while unauthenticated
    act(() => {
      dispatchSyncKeyEvent("newsflash:hidden")
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(mockPerformSync).not.toHaveBeenCalled()
  })

  it("ignores events for non-synced keys", async () => {
    renderHook(() => useSyncContext(), { wrapper })

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    mockPerformSync.mockClear()

    // Dispatch event for a non-synced key
    act(() => {
      dispatchSyncKeyEvent("newsflash:theme")
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(mockPerformSync).not.toHaveBeenCalled()
  })

  it("ignores sync events dispatched during an active sync", async () => {
    // Simulate performSync dispatching sync events while it runs
    mockPerformSync.mockImplementation(() => {
      dispatchSyncKeyEvent("newsflash:hidden")
      dispatchSyncKeyEvent("newsflash:readlist")
      return Promise.resolve()
    })

    renderHook(() => useSyncContext(), { wrapper })

    // Wait for mount sync (which dispatches events internally)
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    mockPerformSync.mockClear()
    mockPerformSync.mockResolvedValue(undefined)

    // Advance well past the debounce window — no re-sync should fire
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })

    expect(mockPerformSync).not.toHaveBeenCalled()
  })

  it("cancels pending debounce when manual sync is triggered", async () => {
    const { result } = renderHook(() => useSyncContext(), { wrapper })

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    mockPerformSync.mockClear()

    // Dispatch a synced key change to start the debounce timer
    act(() => {
      dispatchSyncKeyEvent("newsflash:hidden")
    })

    // Trigger manual sync before debounce fires
    await act(async () => {
      result.current.triggerSync()
    })

    // Manual sync fires immediately
    expect(mockPerformSync).toHaveBeenCalledTimes(1)
    mockPerformSync.mockClear()

    // Advance past the debounce — the cancelled debounce should NOT fire
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(mockPerformSync).not.toHaveBeenCalled()
  })
})
