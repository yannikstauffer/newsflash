import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SyncSettings } from "./sync-settings"

import type { SyncStatus } from "../sync-status"

const mockTriggerSync = vi.fn()
const mockSignOut = vi.fn().mockResolvedValue(undefined)
let mockContextValue = {
  syncStatus: "IDLE" as SyncStatus,
  userEmail: null as string | null,
  isAuthenticated: false,
  triggerSync: mockTriggerSync,
  signOut: mockSignOut,
}

vi.mock("../sync-context", () => ({
  useSyncContext: () => mockContextValue,
}))

vi.mock("../sync-service", () => ({
  getLastSyncedTimestamp: () => null,
}))

const mockSignInWithOtp = vi.fn()
vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () =>
    Promise.resolve({
      auth: {
        signInWithOtp: mockSignInWithOtp,
      },
    }),
}))

describe("SyncSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockContextValue = {
      syncStatus: "IDLE",
      userEmail: null,
      isAuthenticated: false,
      triggerSync: mockTriggerSync,
      signOut: mockSignOut,
    }
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe("unauthenticated", () => {
    it("renders email input and send button", () => {
      render(<SyncSettings />)

      expect(screen.getByTestId("sync-email-input")).toBeInTheDocument()
      expect(screen.getByTestId("send-magic-link-button")).toBeInTheDocument()
      expect(screen.getByText("Cross-Device Sync")).toBeInTheDocument()
    })

    it("does not show sync controls when unauthenticated", () => {
      render(<SyncSettings />)

      expect(screen.queryByTestId("sync-now-button")).not.toBeInTheDocument()
      expect(screen.queryByTestId("sign-out-button")).not.toBeInTheDocument()
    })

    it("shows validation error for invalid email", async () => {
      render(<SyncSettings />)

      const emailInput = screen.getByTestId("sync-email-input")
      const form = emailInput.closest("form")!

      fireEvent.change(emailInput, { target: { value: "invalid" } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByTestId("sync-email-error")).toBeInTheDocument()
      })
      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })

    it("sends magic link on valid email submit", async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null })

      render(<SyncSettings />)

      const emailInput = screen.getByTestId("sync-email-input")
      const form = emailInput.closest("form")!

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByTestId("magic-link-sent")).toBeInTheDocument()
      })
      expect(mockSignInWithOtp).toHaveBeenCalledWith({ email: "test@example.com" })
    })

    it("shows error when magic link send fails", async () => {
      mockSignInWithOtp.mockResolvedValue({ error: { message: "Rate limited" } })

      render(<SyncSettings />)

      const emailInput = screen.getByTestId("sync-email-input")
      const form = emailInput.closest("form")!

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByTestId("sync-email-error")).toBeInTheDocument()
      })
    })
  })

  describe("authenticated", () => {
    beforeEach(() => {
      mockContextValue = {
        syncStatus: "IDLE",
        userEmail: "test@example.com",
        isAuthenticated: true,
        triggerSync: mockTriggerSync,
        signOut: mockSignOut,
      }
    })

    it("renders sync controls when authenticated", () => {
      render(<SyncSettings />)

      expect(screen.getByTestId("sync-now-button")).toBeInTheDocument()
      expect(screen.getByTestId("sign-out-button")).toBeInTheDocument()
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
    })

    it("does not show email form when authenticated", () => {
      render(<SyncSettings />)

      expect(screen.queryByTestId("sync-email-input")).not.toBeInTheDocument()
    })

    it("triggers sync on button click", () => {
      render(<SyncSettings />)

      fireEvent.click(screen.getByTestId("sync-now-button"))
      expect(mockTriggerSync).toHaveBeenCalled()
    })

    it("disables sync button during syncing", () => {
      mockContextValue.syncStatus = "SYNCING"
      render(<SyncSettings />)

      expect(screen.getByTestId("sync-now-button")).toBeDisabled()
    })

    it("calls signOut on sign out button click", () => {
      render(<SyncSettings />)

      fireEvent.click(screen.getByTestId("sign-out-button"))
      expect(mockSignOut).toHaveBeenCalled()
    })
  })
})
