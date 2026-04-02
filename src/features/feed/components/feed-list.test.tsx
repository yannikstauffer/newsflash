import { render, screen } from "@testing-library/react"
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
    t: (key: string) => key,
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
  it("does not show spinner when not pulling", () => {
    mockPullToRefreshReturn = {
      containerRef: { current: null },
      pullOffset: 0,
      isPulling: false,
    }

    render(<FeedList {...defaultProps} />)

    expect(screen.queryByTestId("pull-to-refresh-spinner")).toBeNull()
  })

  it("shows spinner during pull-to-refresh interaction", () => {
    mockPullToRefreshReturn = {
      containerRef: { current: null },
      pullOffset: 50,
      isPulling: true,
    }

    render(<FeedList {...defaultProps} />)

    expect(screen.getByTestId("pull-to-refresh-spinner")).toBeDefined()
  })

  it("shows spinner while refreshing with pull offset", () => {
    mockPullToRefreshReturn = {
      containerRef: { current: null },
      pullOffset: 64,
      isPulling: false,
    }

    render(<FeedList {...defaultProps} loading={true} />)

    expect(screen.getByTestId("pull-to-refresh-spinner")).toBeDefined()
  })
})
