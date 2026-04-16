import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FeedList } from "./feed-list"

import type { NormalizedArticle } from "@/features/connectors/types"

vi.mock("@/hooks/use-lazy-list", () => ({
  useLazyList: (items: NormalizedArticle[]) => ({
    visibleItems: items,
    sentinelRef: { current: null },
  }),
}))

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && typeof options.count === "number") {
        return `${key}:${options.count}`
      }
      return key
    },
  }),
}))

let mockPullToRefreshReturn = {
  containerRef: { current: null },
  pullOffset: 0,
  isPulling: false,
}

vi.mock("@/hooks/use-pull-to-refresh", () => ({
  usePullToRefresh: () => mockPullToRefreshReturn,
}))

function makeArticle(id: string): NormalizedArticle {
  return {
    id,
    title: `Article ${id}`,
    description: "Description",
    link: `https://example.com/${id}`,
    publishedAt: new Date("2026-03-20"),
    source: "test",
    language: "en",
  }
}

vi.mock("./article-card", () => ({
  ArticleCard: ({ article }: { article: NormalizedArticle }) => (
    <div data-testid={`article-${article.id}`}>{article.title}</div>
  ),
}))

const defaultProps = {
  articles: [makeArticle("1"), makeArticle("2")],
  loading: false,
  errors: [],
  hiddenIds: [],
  showHidden: false,
  onRefresh: vi.fn(),
}

describe("FeedList", () => {
  it("does not show spinner icon when not pulling", () => {
    mockPullToRefreshReturn = {
      containerRef: { current: null },
      pullOffset: 0,
      isPulling: false,
    }

    render(<FeedList {...defaultProps} />)

    const spacer = screen.getByTestId("pull-to-refresh-spinner")
    expect(spacer.querySelector(".animate-spin")).toBeNull()
    expect(spacer.getAttribute("aria-hidden")).toBe("true")
  })

  it("shows spinner during pull-to-refresh interaction", () => {
    mockPullToRefreshReturn = {
      containerRef: { current: null },
      pullOffset: 50,
      isPulling: true,
    }

    render(<FeedList {...defaultProps} />)

    const spacer = screen.getByTestId("pull-to-refresh-spinner")
    expect(spacer.querySelector(".animate-spin")).not.toBeNull()
    expect(spacer.getAttribute("aria-hidden")).toBe("false")
  })

  describe("pending articles button", () => {
    it("does not render the button when pendingCount is 0", () => {
      render(<FeedList {...defaultProps} pendingCount={0} onAcceptPending={vi.fn()} />)

      expect(screen.queryByText(/feed\.showNewerArticles/)).toBeNull()
    })

    it("does not render the button when pendingCount is undefined", () => {
      render(<FeedList {...defaultProps} />)

      expect(screen.queryByText(/feed\.showNewerArticles/)).toBeNull()
    })

    it("renders the button with the pending count when pendingCount > 0", () => {
      render(<FeedList {...defaultProps} pendingCount={5} onAcceptPending={vi.fn()} />)

      expect(screen.getByRole("button", { name: /feed\.showNewerArticles:5/ })).toBeDefined()
    })

    it("invokes onAcceptPending when the button is clicked", () => {
      const onAcceptPending = vi.fn()
      render(<FeedList {...defaultProps} pendingCount={3} onAcceptPending={onAcceptPending} />)

      fireEvent.click(screen.getByRole("button", { name: /feed\.showNewerArticles:3/ }))

      expect(onAcceptPending).toHaveBeenCalledTimes(1)
    })
  })

  it("shows spinner while refreshing with pull offset", () => {
    mockPullToRefreshReturn = {
      containerRef: { current: null },
      pullOffset: 64,
      isPulling: false,
    }

    render(<FeedList {...defaultProps} loading={true} />)

    const spacer = screen.getByTestId("pull-to-refresh-spinner")
    expect(spacer.querySelector(".animate-spin")).not.toBeNull()
    expect(spacer.getAttribute("aria-hidden")).toBe("false")
  })
})
