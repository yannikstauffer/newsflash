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
const mockVerifyOtp = vi.fn()
vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () =>
    Promise.resolve({
      auth: {
        signInWithOtp: mockSignInWithOtp,
        verifyOtp: mockVerifyOtp,
      },
    }),
}))

async function submitEmail(email: string) {
  const emailInput = screen.getByTestId("sync-email-input")
  const form = emailInput.closest("form")!
  fireEvent.change(emailInput, { target: { value: email } })
  fireEvent.submit(form)
}

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
      expect(screen.getByTestId("send-code-button")).toBeInTheDocument()
      expect(screen.getByText("Cross-Device Sync")).toBeInTheDocument()
    })

    it("does not show sync controls when unauthenticated", () => {
      render(<SyncSettings />)

      expect(screen.queryByTestId("sync-now-button")).not.toBeInTheDocument()
      expect(screen.queryByTestId("sign-out-button")).not.toBeInTheDocument()
    })

    it("shows validation error for invalid email and does not call signInWithOtp", async () => {
      render(<SyncSettings />)

      await submitEmail("invalid")

      await waitFor(() => {
        expect(screen.getByTestId("sync-email-error")).toBeInTheDocument()
      })
      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })

    it("advances to the code-entry step on valid email submit", async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null })

      render(<SyncSettings />)

      await submitEmail("test@example.com")

      await waitFor(() => {
        expect(screen.getByTestId("sync-code-input")).toBeInTheDocument()
      })
      expect(screen.getByTestId("verify-code-button")).toBeInTheDocument()
      expect(mockSignInWithOtp).toHaveBeenCalledWith({ email: "test@example.com" })
    })

    it("shows error when send fails and stays on email step", async () => {
      mockSignInWithOtp.mockResolvedValue({ error: { message: "Rate limited" } })

      render(<SyncSettings />)

      await submitEmail("test@example.com")

      await waitFor(() => {
        expect(screen.getByTestId("sync-email-error")).toBeInTheDocument()
      })
      expect(screen.queryByTestId("sync-code-input")).not.toBeInTheDocument()
    })

    it("verifies the code with the expected payload", async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null })
      mockVerifyOtp.mockResolvedValue({ error: null })

      render(<SyncSettings />)

      await submitEmail("test@example.com")

      const codeInput = await screen.findByTestId("sync-code-input")
      const codeForm = codeInput.closest("form")!
      fireEvent.change(codeInput, { target: { value: "123456" } })
      fireEvent.submit(codeForm)

      await waitFor(() => {
        expect(mockVerifyOtp).toHaveBeenCalledWith({
          email: "test@example.com",
          token: "123456",
          type: "email",
        })
      })
    })

    it("shows a generic error when verifyOtp fails and stays on the code step", async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null })
      mockVerifyOtp.mockResolvedValue({ error: { message: "bad code" } })

      render(<SyncSettings />)

      await submitEmail("test@example.com")

      const codeInput = await screen.findByTestId("sync-code-input")
      const codeForm = codeInput.closest("form")!
      fireEvent.change(codeInput, { target: { value: "123456" } })
      fireEvent.submit(codeForm)

      await waitFor(() => {
        expect(screen.getByTestId("sync-code-error")).toBeInTheDocument()
      })
      expect(screen.getByTestId("sync-code-input")).toBeInTheDocument()
    })

    it("returns to the email step and clears the code via 'Use a different email'", async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null })

      render(<SyncSettings />)

      await submitEmail("test@example.com")

      const codeInput = await screen.findByTestId("sync-code-input")
      fireEvent.change(codeInput, { target: { value: "999999" } })

      fireEvent.click(screen.getByTestId("use-different-email-button"))

      await waitFor(() => {
        expect(screen.getByTestId("sync-email-input")).toBeInTheDocument()
      })
      expect(screen.queryByTestId("sync-code-input")).not.toBeInTheDocument()

      mockSignInWithOtp.mockResolvedValue({ error: null })
      await submitEmail("other@example.com")
      const nextCodeInput = await screen.findByTestId("sync-code-input")
      expect((nextCodeInput as HTMLInputElement).value).toBe("")
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
