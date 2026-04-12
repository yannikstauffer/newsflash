import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FeedPage } from "./feed-page"

vi.mock("../hooks/use-feed-page")
vi.mock("./filter-bar", () => ({
  FilterBar: () => <div data-testid="filter-bar" />,
}))
vi.mock("./feed-list", () => ({
  FeedList: () => <div data-testid="feed-list" />,
}))
vi.mock("./feed-status-row", () => ({
  FeedStatusRow: ({ lastRefreshedAt }: { lastRefreshedAt: Date | null }) => (
    <p data-testid="feed-status-row">
      {lastRefreshedAt ? `Refreshed ${lastRefreshedAt.toISOString()}` : ""}
    </p>
  ),
}))

const { useFeedPage } = await import("../hooks/use-feed-page") as {
  useFeedPage: ReturnType<typeof vi.fn>
}

const baseMockReturn = {
  filterBarProps: {
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
    articleCount: 10,
    hiddenCount: 2,
  },
  feedListProps: {
    filteredArticles: [],
    loading: false,
    errors: [],
    hiddenIds: [],
    showHidden: false,
    renderActions: vi.fn(),
    renderWrapper: vi.fn(),
    emptyMessage: undefined,
    onRefresh: vi.fn(),
  },
  lastRefreshedAt: null as Date | null,
}

describe("FeedPage", () => {
  it("renders FeedStatusRow between filter bar and feed list", () => {
    useFeedPage.mockReturnValue({
      ...baseMockReturn,
      lastRefreshedAt: new Date("2026-04-09T10:00:00Z"),
    })

    render(<FeedPage />)

    const filterBar = screen.getByTestId("filter-bar")
    const statusRow = screen.getByTestId("feed-status-row")
    const feedList = screen.getByTestId("feed-list")

    expect(statusRow.textContent).toContain("Refreshed")

    // Verify ordering: filter bar -> status row -> feed list
    expect(
      filterBar.compareDocumentPosition(statusRow) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      statusRow.compareDocumentPosition(feedList) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("renders FeedStatusRow even when lastRefreshedAt is null", () => {
    useFeedPage.mockReturnValue({
      ...baseMockReturn,
      lastRefreshedAt: null,
    })

    render(<FeedPage />)

    expect(screen.getByTestId("feed-status-row")).toBeDefined()
  })

  it("renders filter bar and feed list", () => {
    useFeedPage.mockReturnValue(baseMockReturn)

    render(<FeedPage />)

    expect(screen.getByTestId("filter-bar")).toBeDefined()
    expect(screen.getByTestId("feed-list")).toBeDefined()
  })
})
