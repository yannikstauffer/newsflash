import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FeedPage } from "./feed-page"

vi.mock("../hooks/use-feed-page")
vi.mock("@/components/install-banner", () => ({
  InstallBanner: () => null,
}))
vi.mock("./filter-bar", () => ({
  FilterBar: () => <div data-testid="filter-bar" />,
}))
vi.mock("./feed-list", () => ({
  FeedList: () => <div data-testid="feed-list" />,
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
  it("renders refresh text between filter bar and feed list when lastRefreshedAt is set", () => {
    useFeedPage.mockReturnValue({
      ...baseMockReturn,
      lastRefreshedAt: new Date(),
    })

    render(<FeedPage />)

    const filterBar = screen.getByTestId("filter-bar")
    const refreshText = screen.getByLabelText("Last refreshed")
    const feedList = screen.getByTestId("feed-list")

    expect(refreshText.textContent).toContain("Refreshed just now")

    // Verify ordering: filter bar -> refresh text -> feed list
    expect(
      filterBar.compareDocumentPosition(refreshText) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      refreshText.compareDocumentPosition(feedList) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("does not render refresh text when lastRefreshedAt is null", () => {
    useFeedPage.mockReturnValue({
      ...baseMockReturn,
      lastRefreshedAt: null,
    })

    render(<FeedPage />)

    expect(screen.queryByLabelText("Last refreshed")).toBeNull()
  })

  it("renders filter bar and feed list", () => {
    useFeedPage.mockReturnValue(baseMockReturn)

    render(<FeedPage />)

    expect(screen.getByTestId("filter-bar")).toBeDefined()
    expect(screen.getByTestId("feed-list")).toBeDefined()
  })
})
