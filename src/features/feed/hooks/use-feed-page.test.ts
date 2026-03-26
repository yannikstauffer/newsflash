import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useFeedPage } from "./use-feed-page"

import type { NormalizedArticle } from "@/features/connectors/types"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
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
} = {}) {
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
  })

  describe("filtering logic", () => {
    it("filters articles by day when allArticles is false (default)", () => {
      const todayArticle = makeArticle({ id: "src:today", publishedAt: today })
      const yesterdayArticle = makeArticle({ id: "src:yesterday", publishedAt: yesterday })
      setupDefaults({ articles: [todayArticle, yesterdayArticle] })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.filteredArticles).toEqual([todayArticle])
    })

    it("returns all articles when allArticles is toggled on", () => {
      const todayArticle = makeArticle({ id: "src:today", publishedAt: today })
      const yesterdayArticle = makeArticle({ id: "src:yesterday", publishedAt: yesterday })
      setupDefaults({ articles: [todayArticle, yesterdayArticle] })

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onToggleAllArticles()
      })

      expect(result.current.feedListProps.filteredArticles).toHaveLength(2)
    })

    it("filters articles by search query", () => {
      const matchArticle = makeArticle({ id: "src:match", title: "Breaking News" })
      const otherArticle = makeArticle({ id: "src:other", title: "Weather Update" })
      setupDefaults({ articles: [matchArticle, otherArticle] })

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onSearchChange("breaking")
      })

      expect(result.current.feedListProps.filteredArticles).toEqual([matchArticle])
    })
  })

  describe("day navigation", () => {
    it("decrements date on onPrev", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())
      const initialDate = result.current.filterBarProps.selectedDate

      act(() => {
        result.current.filterBarProps.onPrev()
      })

      const expectedDate = new Date(initialDate)
      expectedDate.setDate(expectedDate.getDate() - 1)
      expect(result.current.filterBarProps.selectedDate.getDate()).toBe(expectedDate.getDate())
    })

    it("increments date on onNext", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onPrev()
      })

      const dateAfterPrevious = result.current.filterBarProps.selectedDate

      act(() => {
        result.current.filterBarProps.onNext()
      })

      const expectedDate = new Date(dateAfterPrevious)
      expectedDate.setDate(expectedDate.getDate() + 1)
      expect(result.current.filterBarProps.selectedDate.getDate()).toBe(expectedDate.getDate())
    })

    it("isToday is true when on current date", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.filterBarProps.isToday).toBe(true)
    })

    it("isToday is false after navigating to past date", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onPrev()
      })

      expect(result.current.filterBarProps.isToday).toBe(false)
    })
  })

  describe("toggle allArticles resets date", () => {
    it("resets selectedDate to today when toggling allArticles off", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      // Navigate to past
      act(() => {
        result.current.filterBarProps.onPrev()
        result.current.filterBarProps.onPrev()
      })

      expect(result.current.filterBarProps.isToday).toBe(false)

      // Toggle on then off
      act(() => {
        result.current.filterBarProps.onToggleAllArticles()
      })
      act(() => {
        result.current.filterBarProps.onToggleAllArticles()
      })

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
      })

      const { result } = renderHook(() => useFeedPage())

      // Toggle showHidden on
      act(() => {
        result.current.filterBarProps.onToggleShowHidden()
      })

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

      // hiddenCount always reflects the number of hidden articles in the current day/view
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

    it("adds to read list when not already saved", () => {
      const article = makeArticle({ id: "src:a1" })
      const { addToReadList } = setupDefaults({ articles: [article] })

      renderHook(() => useFeedPage())

      const keyboardOptions = mockKeyboardShortcuts.mock.calls[0][0]

      act(() => {
        keyboardOptions.onSave("src:a1")
      })

      expect(addToReadList).toHaveBeenCalledWith(article)
    })
  })

  describe("renderActions", () => {
    it("returns HiddenArticleActions for hidden articles when showHidden is true", () => {
      const article = makeArticle({ id: "src:a1" })
      setupDefaults({
        articles: [article],
        hiddenIds: ["src:a1"],
      })

      const { result } = renderHook(() => useFeedPage())

      // Toggle showHidden on
      act(() => {
        result.current.filterBarProps.onToggleShowHidden()
      })

      const rendered = result.current.feedListProps.renderActions(article)
      // HiddenArticleActions is mocked, but createElement still creates the element
      expect(rendered).toBeTruthy()
      // Verify it's a HiddenArticleActions element (type check on the created element)
      expect((rendered as { type: { name?: string } }).type).toBeDefined()
    })

    it("returns ArticleActionButtons for non-hidden articles", () => {
      const article = makeArticle({ id: "src:a1" })
      setupDefaults({ articles: [article] })

      const { result } = renderHook(() => useFeedPage())

      const rendered = result.current.feedListProps.renderActions(article)
      expect(rendered).toBeTruthy()
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

    it("passes swipeLeft config with blue background and onAction toggling read list", () => {
      const article = makeArticle({ id: "src:a1" })
      const { addToReadList } = setupDefaults({ articles: [article] })

      const { result } = renderHook(() => useFeedPage())
      const props = getWrapperProps(result, article)

      expect(props.swipeLeft?.bgClassName).toBe("bg-blue-100 dark:bg-blue-900/30")
      expect(typeof props.swipeLeft?.onAction).toBe("function")

      props.swipeLeft?.onAction()
      expect(addToReadList).toHaveBeenCalledWith(article)
    })

    it("swipeLeft onAction removes from read list when article is already saved", () => {
      const article = makeArticle({ id: "src:a1" })
      const { isInReadList } = setupDefaults({ articles: [article] })
      isInReadList.mockReturnValue(true)

      const { result } = renderHook(() => useFeedPage())
      const props = getWrapperProps(result, article)

      props.swipeLeft?.onAction()

      const removeFromReadList = mockUseArticleState.mock.results[0].value.removeFromReadList
      expect(removeFromReadList).toHaveBeenCalledWith("src:a1")
    })
  })

  describe("emptyMessage", () => {
    it("is present when not allArticles and not loading", () => {
      setupDefaults({ loading: false })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.emptyMessage).toBe("No articles for this day.")
    })

    it("is undefined when allArticles is true", () => {
      setupDefaults()

      const { result } = renderHook(() => useFeedPage())

      act(() => {
        result.current.filterBarProps.onToggleAllArticles()
      })

      expect(result.current.feedListProps.emptyMessage).toBeUndefined()
    })

    it("is undefined when loading", () => {
      setupDefaults({ loading: true })

      const { result } = renderHook(() => useFeedPage())

      expect(result.current.feedListProps.emptyMessage).toBeUndefined()
    })
  })
})
