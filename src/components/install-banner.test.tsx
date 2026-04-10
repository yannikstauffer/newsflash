import { fireEvent, render, screen } from "@testing-library/react"
import i18n from "i18next"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mockInstallPrompt = vi.fn(() => ({
  canInstall: false,
  isIosSafari: false,
  isDismissed: false,
  triggerInstall: vi.fn(),
  dismiss: vi.fn(),
}))

vi.mock("@/hooks/use-install-prompt", () => ({
  useInstallPrompt: () => mockInstallPrompt(),
}))

import { InstallBanner } from "./install-banner"

describe("InstallBanner", () => {
  let originalLanguage: string

  beforeEach(async () => {
    originalLanguage = i18n.language
    await i18n.changeLanguage("en")
    mockInstallPrompt.mockClear()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage(originalLanguage)
  })

  it("renders install button on Android when canInstall is true", () => {
    const triggerInstall = vi.fn()
    mockInstallPrompt.mockReturnValue({
      canInstall: true,
      isIosSafari: false,
      isDismissed: false,
      triggerInstall,
      dismiss: vi.fn(),
    })

    render(<InstallBanner />)

    expect(screen.getByText("Get the full app experience")).toBeInTheDocument()
    expect(screen.getByText("Install")).toBeInTheDocument()
  })

  it("triggers install when Install button is clicked", () => {
    const triggerInstall = vi.fn()
    mockInstallPrompt.mockReturnValue({
      canInstall: true,
      isIosSafari: false,
      isDismissed: false,
      triggerInstall,
      dismiss: vi.fn(),
    })

    render(<InstallBanner />)
    fireEvent.click(screen.getByText("Install"))

    expect(triggerInstall).toHaveBeenCalled()
  })

  it("renders iOS guidance on Safari", () => {
    mockInstallPrompt.mockReturnValue({
      canInstall: false,
      isIosSafari: true,
      isDismissed: false,
      triggerInstall: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<InstallBanner />)

    expect(
      screen.getByText('Tap Share, then "Add to Home Screen"'),
    ).toBeInTheDocument()
  })

  it("renders nothing when standalone (canInstall and isIosSafari both false)", () => {
    mockInstallPrompt.mockReturnValue({
      canInstall: false,
      isIosSafari: false,
      isDismissed: false,
      triggerInstall: vi.fn(),
      dismiss: vi.fn(),
    })

    const { container } = render(<InstallBanner />)
    expect(container.innerHTML).toBe("")
  })

  it("renders nothing when dismissed", () => {
    mockInstallPrompt.mockReturnValue({
      canInstall: true,
      isIosSafari: false,
      isDismissed: true,
      triggerInstall: vi.fn(),
      dismiss: vi.fn(),
    })

    const { container } = render(<InstallBanner />)
    expect(container.innerHTML).toBe("")
  })

  it("dismiss button has accessible label", () => {
    mockInstallPrompt.mockReturnValue({
      canInstall: true,
      isIosSafari: false,
      isDismissed: false,
      triggerInstall: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<InstallBanner />)

    const dismissButton = screen.getByRole("button", {
      name: "Dismiss install prompt",
    })
    expect(dismissButton).toBeInTheDocument()
  })

  it("calls dismiss when dismiss button is clicked", () => {
    const dismiss = vi.fn()
    mockInstallPrompt.mockReturnValue({
      canInstall: true,
      isIosSafari: false,
      isDismissed: false,
      triggerInstall: vi.fn(),
      dismiss,
    })

    render(<InstallBanner />)
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss install prompt" }),
    )

    expect(dismiss).toHaveBeenCalled()
  })
})
