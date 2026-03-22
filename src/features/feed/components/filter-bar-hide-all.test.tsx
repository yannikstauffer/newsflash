import { fireEvent, render, screen } from "@testing-library/react"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { FilterBar } from "./filter-bar"

vi.mock("sonner", () => ({
  toast: vi.fn(),
}))

vi.mock("@/features/article-actions", () => ({
  useArticleState: () => ({
    unhideArticles: mockUnhideArticles,
  }),
}))

const mockUnhideArticles = vi.fn()

const defaultProps = {
  showHidden: false,
  onToggleShowHidden: vi.fn(),
  searchQuery: "",
  onSearchChange: vi.fn(),
  selectedDate: new Date("2026-03-20"),
  allArticles: false,
  isToday: true,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onToggleAllArticles: vi.fn(),
  lastRefreshedAt: null as Date | null,
  articleCount: 10,
  hiddenCount: 0,
  onHideAll: vi.fn(),
  visibleArticleIds: ["heise:a1", "heise:a2", "heise:a3"],
}

describe("FilterBar Hide All", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders Hide All button", () => {
    render(<FilterBar {...defaultProps} />)

    expect(screen.getByText("Hide All")).toBeDefined()
  })

  it("disables Hide All button when there are no visible articles", () => {
    render(<FilterBar {...defaultProps} visibleArticleIds={[]} />)

    const button = screen.getByText("Hide All")
    expect(button.closest("button")?.disabled).toBe(true)
  })

  it("enables Hide All button when there are visible articles", () => {
    render(<FilterBar {...defaultProps} />)

    const button = screen.getByText("Hide All")
    expect(button.closest("button")?.disabled).toBe(false)
  })

  describe("confirmation dialog", () => {
    it("opens confirmation dialog when Hide All is clicked", () => {
      render(<FilterBar {...defaultProps} />)

      fireEvent.click(screen.getByText("Hide All"))

      expect(screen.getByText(/Hide all articles for/)).toBeDefined()
    })

    it("shows correct article count in dialog", () => {
      render(<FilterBar {...defaultProps} visibleArticleIds={["a", "b", "c"]} />)

      fireEvent.click(screen.getByText("Hide All"))

      expect(screen.getByText(/This will hide 3 articles/)).toBeDefined()
    })

    it("shows day label in dialog title for day mode", () => {
      render(<FilterBar {...defaultProps} allArticles={false} />)

      fireEvent.click(screen.getByText("Hide All"))

      // Should contain the formatted day label, not "all days"
      const title = screen.getByText(/Hide all articles for/)
      expect(title.textContent).not.toContain("all days")
    })

    it("shows 'all days' in dialog title when allArticles is active", () => {
      render(<FilterBar {...defaultProps} allArticles={true} />)

      fireEvent.click(screen.getByText("Hide All"))

      expect(screen.getByText(/Hide all articles for all days/)).toBeDefined()
    })

    it("closes dialog without hiding when Cancel is clicked", () => {
      const onHideAll = vi.fn()
      render(<FilterBar {...defaultProps} onHideAll={onHideAll} />)

      fireEvent.click(screen.getByText("Hide All"))
      fireEvent.click(screen.getByText("Cancel"))

      expect(onHideAll).not.toHaveBeenCalled()
    })
  })

  describe("confirm action", () => {
    it("calls onHideAll when confirmed", () => {
      const onHideAll = vi.fn()
      render(<FilterBar {...defaultProps} onHideAll={onHideAll} />)

      fireEvent.click(screen.getByText("Hide All"))

      // The dialog has a second "Hide All" button as the action
      const buttons = screen.getAllByText("Hide All")
      const confirmButton = buttons.at(-1)!
      fireEvent.click(confirmButton)

      expect(onHideAll).toHaveBeenCalledOnce()
    })

    it("shows undo toast after confirming", () => {
      render(<FilterBar {...defaultProps} visibleArticleIds={["a", "b", "c"]} />)

      fireEvent.click(screen.getByText("Hide All"))
      const buttons = screen.getAllByText("Hide All")
      fireEvent.click(buttons.at(-1)!)

      expect(toast).toHaveBeenCalledWith(
        "3 articles hidden",
        expect.objectContaining({
          duration: 5000,
          action: expect.objectContaining({
            label: "Undo",
          }),
        }),
      )
    })

    it("undo callback calls unhideArticles with captured IDs", () => {
      const ids = ["heise:x1", "heise:x2"]
      render(<FilterBar {...defaultProps} visibleArticleIds={ids} />)

      fireEvent.click(screen.getByText("Hide All"))
      const buttons = screen.getAllByText("Hide All")
      fireEvent.click(buttons.at(-1)!)

      // Extract the undo callback from the toast call
      const toastCall = vi.mocked(toast).mock.calls[0]
      const toastOptions = toastCall[1] as unknown as { action: { onClick: () => void } }
      toastOptions.action.onClick()

      expect(mockUnhideArticles).toHaveBeenCalledWith(ids)
    })
  })
})
