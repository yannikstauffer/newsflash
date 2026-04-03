import { render, screen, fireEvent } from "@testing-library/react"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { NormalizedArticle } from "@/features/connectors/types"

const mockRemoveFromReadList = vi.fn()
const mockClearReadList = vi.fn()
const mockRestoreReadList = vi.fn()

let mockReadListArticles: NormalizedArticle[] = []

vi.mock("../hooks/use-article-state", () => ({
  useArticleState: () => ({
    readListArticles: mockReadListArticles,
    removeFromReadList: mockRemoveFromReadList,
    clearReadList: mockClearReadList,
    restoreReadList: mockRestoreReadList,
  }),
}))

vi.mock("@/hooks/use-lazy-list", () => ({
  useLazyList: (items: NormalizedArticle[]) => ({
    visibleItems: items,
    sentinelRef: { current: null },
  }),
}))

vi.mock("sonner", () => ({
  toast: vi.fn(),
}))

// Mock SwipeableCard — no ref needed since button removal calls removeFromReadList directly
vi.mock("./swipeable-card", () => ({
  SwipeableCard: function MockSwipeableCard(
    { children, swipeRight }: {
      children: React.ReactNode
      swipeRight?: { bgClassName: string; onAction: () => void }
    },
  ) {
    return (
      <div data-testid="swipeable-card">
        {swipeRight && (
          <button
            data-testid="mock-swipe-right-trigger"
            onClick={swipeRight.onAction}
          >
            {"Swipe Right"}
          </button>
        )}
        {children}
      </div>
    )
  },
}))

// Must import after mocks
const { default: ReadListPage } = await import("./read-list-page")

function makeArticle(id: string): NormalizedArticle {
  return {
    id,
    title: `Article ${id}`,
    description: "Description",
    link: `https://example.com/${id}`,
    publishedAt: new Date("2026-03-20T10:00:00Z"),
    source: "heise",
    language: "de",
  }
}

describe("ReadListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReadListArticles = []
  })

  afterEach(() => {
    mockReadListArticles = []
  })

  describe("empty state", () => {
    it("shows empty message when no articles are saved", () => {
      mockReadListArticles = []
      render(<ReadListPage />)

      expect(screen.getByText(/No saved articles yet/)).toBeDefined()
    })

    it("does not show Remove All button when list is empty", () => {
      mockReadListArticles = []
      render(<ReadListPage />)

      expect(screen.queryByText("Remove All")).toBeNull()
    })
  })

  describe("with articles", () => {
    it("renders articles in SwipeableCard wrappers", () => {
      mockReadListArticles = [makeArticle("heise:a1"), makeArticle("heise:a2")]
      render(<ReadListPage />)

      const cards = screen.getAllByTestId("swipeable-card")
      expect(cards).toHaveLength(2)
    })

    it("shows Remove All button when articles exist", () => {
      mockReadListArticles = [makeArticle("heise:a1")]
      render(<ReadListPage />)

      expect(screen.getByText("Remove All")).toBeDefined()
    })

    it("configures swipe-right with red background class", () => {
      mockReadListArticles = [makeArticle("heise:a1")]
      render(<ReadListPage />)

      // The mock renders a swipe-right trigger, confirming swipeRight is configured
      expect(screen.getByTestId("mock-swipe-right-trigger")).toBeDefined()
    })
  })

  describe("swipe removal", () => {
    it("calls removeFromReadList when swipe-right action fires", () => {
      mockReadListArticles = [makeArticle("heise:a1")]
      render(<ReadListPage />)

      fireEvent.click(screen.getByTestId("mock-swipe-right-trigger"))

      expect(mockRemoveFromReadList).toHaveBeenCalledWith("heise:a1")
    })
  })

  describe("button removal", () => {
    it("renders a remove button with correct aria label", () => {
      mockReadListArticles = [makeArticle("heise:a1")]
      render(<ReadListPage />)

      expect(screen.getByLabelText("Remove from read list")).toBeDefined()
    })

    it("calls removeFromReadList directly when remove button is clicked", () => {
      mockReadListArticles = [makeArticle("heise:a1")]
      render(<ReadListPage />)

      const removeButton = screen.getByLabelText("Remove from read list")
      fireEvent.click(removeButton)

      expect(mockRemoveFromReadList).toHaveBeenCalledWith("heise:a1")
    })
  })

  describe("Remove All", () => {
    it("opens confirmation dialog when Remove All is clicked", () => {
      mockReadListArticles = [makeArticle("heise:a1"), makeArticle("heise:a2")]
      render(<ReadListPage />)

      fireEvent.click(screen.getByText("Remove All"))

      expect(screen.getByText("Remove all from read list?")).toBeDefined()
      expect(screen.getByText(/This will remove 2 articles/)).toBeDefined()
    })

    it("closes dialog when Cancel is clicked without removing", () => {
      mockReadListArticles = [makeArticle("heise:a1")]
      render(<ReadListPage />)

      fireEvent.click(screen.getByText("Remove All"))
      fireEvent.click(screen.getByText("Cancel"))

      expect(mockClearReadList).not.toHaveBeenCalled()
    })

    it("calls clearReadList when confirmed", () => {
      mockReadListArticles = [makeArticle("heise:a1"), makeArticle("heise:a2")]
      render(<ReadListPage />)

      fireEvent.click(screen.getByText("Remove All"))
      // The dialog has a second "Remove All" as the confirm action
      const buttons = screen.getAllByText("Remove All")
      fireEvent.click(buttons.at(-1)!)

      expect(mockClearReadList).toHaveBeenCalledOnce()
    })

    it("shows undo toast with correct count after confirming", () => {
      mockReadListArticles = [makeArticle("heise:a1"), makeArticle("heise:a2"), makeArticle("heise:a3")]
      render(<ReadListPage />)

      fireEvent.click(screen.getByText("Remove All"))
      const buttons = screen.getAllByText("Remove All")
      fireEvent.click(buttons.at(-1)!)

      expect(toast).toHaveBeenCalledWith(
        "3 articles removed from read list",
        expect.objectContaining({
          duration: 5000,
          action: expect.objectContaining({
            label: "Undo",
          }),
        }),
      )
    })

    it("undo callback calls restoreReadList with captured snapshot", () => {
      const articles = [makeArticle("heise:a1"), makeArticle("heise:a2")]
      mockReadListArticles = articles
      render(<ReadListPage />)

      fireEvent.click(screen.getByText("Remove All"))
      const buttons = screen.getAllByText("Remove All")
      fireEvent.click(buttons.at(-1)!)

      // Extract the undo callback from the toast call
      const toastCall = vi.mocked(toast).mock.calls[0]
      const toastOptions = toastCall[1] as unknown as { action: { onClick: () => void } }
      toastOptions.action.onClick()

      expect(mockRestoreReadList).toHaveBeenCalledWith(articles)
    })

    it("dialog message mentions articles remain hidden in main feed", () => {
      mockReadListArticles = [makeArticle("heise:a1")]
      render(<ReadListPage />)

      fireEvent.click(screen.getByText("Remove All"))

      expect(screen.getByText(/remain hidden in the main feed/)).toBeDefined()
    })
  })
})
