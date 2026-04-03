import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useFeedPage } from "./use-feed-page"

import type { FeedSearch } from "@/app/router"
import type { NormalizedArticle } from "@/features/connectors/types"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

let mockSearchParams: FeedSearch = {}
const mockNavigate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  getRouteApi: () => ({
    useSearch: () => mockSearchParams,
  }),
  useNavigate: () => mockNavigate,
}))

const mockUseFeedData = vi.fn()
vi.mock("./use-feed-data", () => ({
  useFeedData: (...args: unknown[]) => mockUseFeedData(...args),
}))

const mockUseArticleState = vi.fn()
const { mockSwipeableCard } = vi.hoisted(() => ({
  mockSwipeableCard: vi.fn(() => null),
}))
vi.mock("@/features/article-actions", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  return {
    ...original,
    useArticleState: (...args: unknown[]) => mockUseArticleState(...args),
    useArticleKeyboardShortcuts: vi.fn(),
    ArticleActionButtons: () => null,
    HiddenArticleActions: () => null,
    SwipeableCard: mockSwipeableCard,
  }
})

const mockUseFeedPreferences = vi.fn()
vi.mock("@/features/feed-config/hooks/use-feed-preferences", () => ({
  useFeedPreferences: (...args: unknown[]) => mockUseFeedPreferences(...args),
}))

import { useArticleKeyboardShortcuts } from "@/features/article-actions"

const mockKeyboardShortcuts = vi.mocked(useArticleKeyboardShortcuts)

const today = new Date()
today.setHours(0, 0, 0, 0)

const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)

function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function makeArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    id: "src:art-1",
    title: "Test Article",
    description: "A test article",
    link: "https://example.com",
    publishedAt: today,
    source: "src",
    language: "en",
    ...overrides,
  }
}

function setupDefaults(overrides: {
  articles?: NormalizedArticle[]
  loading?: boolean
  errors?: string[]
  hiddenIds?: string[]
  isFeedEnabled?: (id: string) => boolean
  searchParams?: FeedSearch
} = {}) {
  mockSearchParams = overrides.searchParams ?? {}
  mockNavigate.mockReset()

  const hideArticle = vi.fn()
  const unhideArticle = vi.fn()
  const addToReadList = vi.fn()
  const hideArticles = vi.fn()
  const isHidden = vi.fn((id: string) => (overrides.hiddenIds ?? []).includes(id))
  const isInReadList = vi.fn(() => false)

  mockUseFeedData.mockReturnValue({
    articles: overrides.articles ?? [],
    loading: overrides.loading ?? false,
    errors: overrides.errors ?? [],
    lastRefreshedAt: null,
  })

  mockUseArticleState.mockReturnValue({
    hiddenIds: overrides.hiddenIds ?? [],
    isHidden,
    isInReadList,
    hideArticle,
    unhideArticle,
    addToReadList,
    hideArticles,
    unhideArticles: vi.fn(),
    readListIds: [],
    readListArticles: [],
    removeFromReadList: vi.fn(),
    clearReadList: vi.fn(),
    restoreReadList: vi.fn(),
    removeHiddenBySource: vi.fn(),
    removeReadListBySource: vi.fn(),
  })

  mockUseFeedPreferences.mockReturnValue({
    preferences: {},
    isFeedEnabled: overrides.isFeedEnabled ?? (() => true),
    toggleFeed: vi.fn(),
    setFeedEnabled: vi.fn(),
    setAllForSource: vi.fn(),
  })

  return { hideArticle, unhideArticle, addToReadList, hideArticles, isHidden, isInReadList }
}

describe("useFeedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = {}
  })

  describe("filtering logic", () => {
    it("filters articles by day when allArticles is false (default)", () => {
      const todayArticle = makeArticle({ id: "src:today", publishedAt: today })
      const yesterdayArticle = makeArticle({ id: "src:yesterday", publishedAt: yesterday })
      setupDefaults({ articles: [todayArticle, yesterdayArticle] })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.filteredArticles).toEqual([todayArticle])
    })

    it("returns all articles when view=all in search params", () => {
      const todayArticle = makeArticle({ id: "src:today", publishedAt: today })
      const yesterdayArticle = makeArticle({ id: "src:yesterday", publishedAt: yesterday })
      setupDefaults({
        articles: [todayArticle, yesterdayArticle],
        searchParams: { view: "all" },
      })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.filteredArticles).toHaveLength(2)
    })

    it("filters articles by search query from URL param", () => {
      const matchArticle = makeArticle({ id: "src:match", title: "Breaking News" })
      const otherArticle = makeArticle({ id: "src:other", title: "Weather Update" })
      setupDefaults({
        articles: [matchArticle, otherArticle],
        searchParams: { q: "breaking" },
      })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.filteredArticles).toEqual([matchArticle])
    })

    it("shows articles for specific date from URL param", () => {
      const todayArticle = makeArticle({ id: "src:today", publishedAt: today })
      const yesterdayArticle = makeArticle({ id: "src:yesterday", publishedAt: yesterday })
      setupDefaults({
        articles: [todayArticle, yesterdayArticle],
        searchParams: { date: formatDate(yesterday) },
      })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.filteredArticles).toEqual([yesterdayArticle])
    })
  })

  describe("day navigation", () => {
    it("onPrev calls navigate with previous day's date param", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onPrev()
      })

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({})
      expect(newSearch.date).toBe(formatDate(yesterday))
    })

    it("onNext from yesterday calls navigate with date removed (today)", () => {
      setupDefaults({ searchParams: { date: formatDate(yesterday) } })

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onNext()
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({ date: formatDate(yesterday) })
      expect(newSearch.date).toBeUndefined()
    })

    it("isToday is true when no date param (default)", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.isToday).toBe(true)
    })

    it("isToday is false when date param is yesterday", () => {
      setupDefaults({ searchParams: { date: formatDate(yesterday) } })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.isToday).toBe(false)
    })
  })

  describe("toggle allArticles", () => {
    it("onToggleAllArticles navigates with view=all when currently in day view", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onToggleAllArticles()
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({})
      expect(newSearch.view).toBe("all")
    })

    it("onToggleAllArticles navigates with view and date removed when in all view", () => {
      setupDefaults({ searchParams: { view: "all", date: formatDate(yesterday) } })

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onToggleAllArticles()
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({ view: "all", date: formatDate(yesterday) })
      expect(newSearch.view).toBeUndefined()
      expect(newSearch.date).toBeUndefined()
    })
  })

  describe("toggle showHidden", () => {
    it("onToggleShowHidden navigates with hidden=true when currently false", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onToggleShowHidden()
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({})
      expect(newSearch.hidden).toBe(true)
    })

    it("onToggleShowHidden navigates with hidden removed when currently true", () => {
      setupDefaults({ searchParams: { hidden: true } })

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onToggleShowHidden()
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({ hidden: true })
      expect(newSearch.hidden).toBeUndefined()
    })
  })

  describe("search query", () => {
    it("onSearchChange navigates with q param", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onSearchChange("bitcoin")
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({})
      expect(newSearch.q).toBe("bitcoin")
    })

    it("onSearchChange navigates with q removed when empty", () => {
      setupDefaults({ searchParams: { q: "old" } })

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onSearchChange("")
      })

      const searchFunction = mockNavigate.mock.calls[0][0].search
      const newSearch = searchFunction({ q: "old" })
      expect(newSearch.q).toBeUndefined()
    })
  })

  describe("state derivation from search params", () => {
    it("derives selectedDate from date param", () => {
      setupDefaults({ searchParams: { date: "2026-04-01" } })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.selectedDate.getFullYear()).toBe(2026)
      expect(result.current.filterBarProps.selectedDate.getMonth()).toBe(3) // April = 3
      expect(result.current.filterBarProps.selectedDate.getDate()).toBe(1)
    })

    it("derives allArticles=true from view=all", () => {
      setupDefaults({ searchParams: { view: "all" } })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.allArticles).toBe(true)
    })

    it("derives searchQuery from q param", () => {
      setupDefaults({ searchParams: { q: "test" } })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.searchQuery).toBe("test")
    })

    it("derives showHidden from hidden param", () => {
      setupDefaults({ searchParams: { hidden: true } })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.showHidden).toBe(true)
    })

    it("uses defaults when no params", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.allArticles).toBe(false)
      expect(result.current.filterBarProps.searchQuery).toBe("")
      expect(result.current.filterBarProps.showHidden).toBe(false)
      expect(result.current.filterBarProps.isToday).toBe(true)
    })
  })

  describe("articleCount and hiddenCount", () => {
    it("when showHidden is true, articleCount excludes hidden and hiddenCount reflects hidden count", () => {
      const article1 = makeArticle({ id: "src:a1" })
      const article2 = makeArticle({ id: "src:a2" })
      setupDefaults({
        articles: [article1, article2],
        hiddenIds: ["src:a2"],
        searchParams: { hidden: true },
      })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.articleCount).toBe(1)
      expect(result.current.filterBarProps.hiddenCount).toBe(1)
    })

    it("when showHidden is false (default), hiddenCount reflects hidden articles in current view", () => {
      const article1 = makeArticle({ id: "src:a1" })
      const article2 = makeArticle({ id: "src:a2" })
      setupDefaults({
        articles: [article1, article2],
        hiddenIds: ["src:a2"],
      })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.hiddenCount).toBe(1)
    })
  })

  describe("keyboard hide callback", () => {
    it("falls back to hideArticle when no card ref", () => {
      const article = makeArticle({ id: "src:a1" })
      const { hideArticle } = setupDefaults({ articles: [article] })

      renderHook(() => useFeedPage())

      const keyboardOptions = mockKeyboardShortcuts.mock.calls[0][0]

      act(() => {
        keyboardOptions.onHide("src:a1")
      })

      expect(hideArticle).toHaveBeenCalledWith("src:a1")
    })
  })

  describe("keyboard save callback", () => {
    it("does nothing when article is not found", () => {
      const { addToReadList, hideArticle } = setupDefaults({ articles: [] })

      renderHook(() => useFeedPage())

      const keyboardOptions = mockKeyboardShortcuts.mock.calls[0][0]

      act(() => {
        keyboardOptions.onSave("src:nonexistent")
      })

      expect(addToReadList).not.toHaveBeenCalled()
      expect(hideArticle).not.toHaveBeenCalled()
    })

    it("does nothing when article is already in read list", () => {
      const article = makeArticle({ id: "src:a1" })
      const { addToReadList, hideArticle, isInReadList } = setupDefaults({ articles: [article] })
      isInReadList.mockReturnValue(true)

      renderHook(() => useFeedPage())

      const keyboardOptions = mockKeyboardShortcuts.mock.calls[0][0]

      act(() => {
        keyboardOptions.onSave("src:a1")
      })

      expect(addToReadList).not.toHaveBeenCalled()
      expect(hideArticle).not.toHaveBeenCalled()
    })

    it("adds to read list and hides article when not already saved", () => {
      const article = makeArticle({ id: "src:a1" })
      const { addToReadList, hideArticle } = setupDefaults({ articles: [article] })

      renderHook(() => useFeedPage())

      const keyboardOptions = mockKeyboardShortcuts.mock.calls[0][0]

      act(() => {
        keyboardOptions.onSave("src:a1")
      })

      expect(addToReadList).toHaveBeenCalledWith(article)
      expect(hideArticle).toHaveBeenCalledWith("src:a1")
    })
  })

  describe("renderActions", () => {
    it("returns HiddenArticleActions for hidden articles when showHidden is true", () => {
      const article = makeArticle({ id: "src:a1" })
      setupDefaults({
        articles: [article],
        hiddenIds: ["src:a1"],
        searchParams: { hidden: true },
      })

      const { result } = renderHook(() => useFeedPage())

      const rendered = result.current.feedListProps.renderActions(article)
      expect(rendered).toBeTruthy()
      expect((rendered as { type: { name?: string } }).type).toBeDefined()
    })

    it("returns ArticleActionButtons for non-hidden articles", () => {
      const article = makeArticle({ id: "src:a1" })
      setupDefaults({ articles: [article] })

      const { result } = renderHook(() => useFeedPage())

      const rendered = result.current.feedListProps.renderActions(article)
      expect(rendered).toBeTruthy()
    })

    it("onSave calls addToReadList and hideArticle when not already saved", () => {
      const article = makeArticle({ id: "src:a1" })
      const { addToReadList, hideArticle } = setupDefaults({ articles: [article] })

      const { result } = renderHook(() => useFeedPage())

      const rendered = result.current.feedListProps.renderActions(article) as {
        props: { onSave: () => void }
      }
      rendered.props.onSave()

      expect(addToReadList).toHaveBeenCalledWith(article)
      expect(hideArticle).toHaveBeenCalledWith("src:a1")
    })

    it("onSave removes from read list and does not hide when already saved", () => {
      const article = makeArticle({ id: "src:a1" })
      const { hideArticle, isInReadList } = setupDefaults({ articles: [article] })
      isInReadList.mockReturnValue(true)

      const { result } = renderHook(() => useFeedPage())

      const rendered = result.current.feedListProps.renderActions(article) as {
        props: { onSave: () => void }
      }
      rendered.props.onSave()

      const removeFromReadList = mockUseArticleState.mock.results[0].value.removeFromReadList
      expect(removeFromReadList).toHaveBeenCalledWith("src:a1")
      expect(hideArticle).not.toHaveBeenCalled()
    })
  })

  describe("renderWrapper swipe config", () => {
    interface SwipeConfigTestProps {
      swipeRight?: { bgClassName: string; onAction: () => void }
      swipeLeft?: { bgClassName: string; onAction: () => void }
    }

    function getWrapperProps(
      result: { current: ReturnType<typeof useFeedPage> },
      article: NormalizedArticle,
    ): SwipeConfigTestProps {
      const element = result.current.feedListProps.renderWrapper(article, "mock-child") as {
        props: SwipeConfigTestProps
      }
      return element.props
    }

    it("passes swipeRight config with amber background and onAction calling hideArticle", () => {
      const article = makeArticle({ id: "src:a1" })
      const { hideArticle } = setupDefaults({ articles: [article] })

      const { result } = renderHook(() => useFeedPage())
      const props = getWrapperProps(result, article)

      expect(props.swipeRight?.bgClassName).toBe("bg-amber-100 dark:bg-amber-900/30")
      expect(typeof props.swipeRight?.onAction).toBe("function")

      props.swipeRight?.onAction()
      expect(hideArticle).toHaveBeenCalledWith("src:a1")
    })

    it("passes swipeLeft config with blue background and onAction calling addToReadList and hideArticle", () => {
      const article = makeArticle({ id: "src:a1" })
      const { addToReadList, hideArticle } = setupDefaults({ articles: [article] })

      const { result } = renderHook(() => useFeedPage())
      const props = getWrapperProps(result, article)

      expect(props.swipeLeft?.bgClassName).toBe("bg-blue-100 dark:bg-blue-900/30")
      expect(typeof props.swipeLeft?.onAction).toBe("function")

      props.swipeLeft?.onAction()
      expect(addToReadList).toHaveBeenCalledWith(article)
      expect(hideArticle).toHaveBeenCalledWith("src:a1")
    })

    it("swipeLeft onAction removes from read list when article is already saved and does not hide", () => {
      const article = makeArticle({ id: "src:a1" })
      const { isInReadList, hideArticle } = setupDefaults({ articles: [article] })
      isInReadList.mockReturnValue(true)

      const { result } = renderHook(() => useFeedPage())
      const props = getWrapperProps(result, article)

      props.swipeLeft?.onAction()

      const removeFromReadList = mockUseArticleState.mock.results[0].value.removeFromReadList
      expect(removeFromReadList).toHaveBeenCalledWith("src:a1")
      expect(hideArticle).not.toHaveBeenCalled()
    })
  })

  describe("emptyMessage", () => {
    it("is present when not allArticles and not loading", () => {
      setupDefaults({ loading: false })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.emptyMessage).toBe("No articles for this day.")
    })

    it("is undefined when view=all", () => {
      setupDefaults({ searchParams: { view: "all" } })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.emptyMessage).toBeUndefined()
    })

    it("is undefined when loading", () => {
      setupDefaults({ loading: true })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.emptyMessage).toBeUndefined()
    })
  })
})
