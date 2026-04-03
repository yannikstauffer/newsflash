import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { BookmarkPlus, EyeOff } from "lucide-react"
import { createElement, useCallback, useEffect, useMemo, useRef } from "react"

import { useFeedData } from "./use-feed-data"
import { filterArticles } from "../utils/filter-articles"
import { filterByDay } from "../utils/filter-by-day"

import type { SwipeableCardHandle } from "@/features/article-actions"
import type { NormalizedArticle } from "@/features/connectors/types"
import type { ReactNode } from "react"

import {
  ArticleActionButtons,
  HiddenArticleActions,
  SwipeableCard,
  useArticleKeyboardShortcuts,
  useArticleState,
} from "@/features/article-actions"
const feedRoute = getRouteApi("/")
import { connectors } from "@/features/connectors/registry"
import { useFeedPreferences } from "@/features/feed-config/hooks/use-feed-preferences"
import { useFilterPreferences } from "@/features/feed-config/hooks/use-filter-preferences"

interface FilterBarProps {
  readonly showHidden: boolean
  readonly onToggleShowHidden: () => void
  readonly searchQuery: string
  readonly onSearchChange: (query: string) => void
  readonly selectedDate: Date
  readonly allArticles: boolean
  readonly isToday: boolean
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly onToggleAllArticles: () => void
  readonly articleCount: number
  readonly hiddenCount: number
}

interface FeedListProps {
  readonly filteredArticles: NormalizedArticle[]
  readonly loading: boolean
  readonly errors: string[]
  readonly hiddenIds: string[]
  readonly showHidden: boolean
  readonly renderActions: (article: NormalizedArticle) => ReactNode
  readonly renderWrapper: (
    article: NormalizedArticle,
    children: ReactNode,
  ) => ReactNode
  readonly emptyMessage: string | undefined
  readonly onRefresh: () => void
}

interface UseFeedPageResult {
  readonly filterBarProps: FilterBarProps
  readonly feedListProps: FeedListProps
  readonly lastRefreshedAt: Date | null
}

function formatDateParameter(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isDateToday(d: Date): boolean {
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function useFeedPage(): UseFeedPageResult {
  const { isFeedEnabled } = useFeedPreferences()
  const { isFilterEnabled } = useFilterPreferences()
  const { articles, loading, errors, lastRefreshedAt, refresh } = useFeedData(isFeedEnabled)
  const {
    hiddenIds,
    isHidden,
    isInReadList,
    hideArticle,
    unhideArticle,
    addToReadList,
    removeFromReadList,
  } = useArticleState()

  const { date, view, q, hidden } = feedRoute.useSearch()
  const navigate = useNavigate({ from: "/" })

  const hoveredArticleRef = useRef<string | undefined>(undefined)
  const focusedArticleRef = useRef<string | undefined>(undefined)
  const articlesRef = useRef<NormalizedArticle[]>([])
  const swipeableCardReferences = useRef<Map<string, SwipeableCardHandle>>(new Map())

  const selectedDate = useMemo(() => {
    if (date) {
      const parsed = new Date(date + "T00:00:00")
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }, [date])
  const allArticles = view === "all"
  const searchQuery = q ?? ""
  const showHidden = hidden ?? false

  const filteredArticles = useMemo(() => {
    const filtered = filterArticles(articles, {
      isFeedEnabled,
      showHidden,
      hiddenIds,
      searchQuery,
      connectors,
      isFilterEnabled,
    })
    if (allArticles) {
      return filtered
    }
    return filterByDay(filtered, selectedDate)
  }, [
    articles, isFeedEnabled, isFilterEnabled, showHidden,
    hiddenIds, searchQuery, allArticles, selectedDate,
  ])

  const { articleCount, hiddenCount } = useMemo(() => {
    const hiddenSet = new Set(hiddenIds)
    const visibleFiltered = filterArticles(articles, {
      isFeedEnabled,
      showHidden: false,
      hiddenIds,
      searchQuery,
      connectors,
      isFilterEnabled,
    })
    const allFiltered = filterArticles(articles, {
      isFeedEnabled,
      showHidden: true,
      hiddenIds,
      searchQuery,
      connectors,
      isFilterEnabled,
    })
    const applyDay = (list: NormalizedArticle[]) =>
      allArticles ? list : filterByDay(list, selectedDate)
    const visible = applyDay(visibleFiltered)
    const all = applyDay(allFiltered)
    const hidden = all.filter((a) => hiddenSet.has(a.id))
    return { articleCount: visible.length, hiddenCount: hidden.length }
  }, [
    articles, isFeedEnabled, isFilterEnabled, hiddenIds,
    searchQuery, allArticles, selectedDate,
  ])

  const isToday = useMemo(() => isDateToday(selectedDate), [selectedDate])

  const handlePreviousDay = useCallback(() => {
    const previous = new Date(selectedDate)
    previous.setDate(previous.getDate() - 1)
    navigate({
      search: (old) => ({
        ...old,
        date: formatDateParameter(previous),
      }),
    })
  }, [selectedDate, navigate])

  const handleNextDay = useCallback(() => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    navigate({
      search: (old) => ({
        ...old,
        date: isDateToday(next) ? undefined : formatDateParameter(next),
      }),
    })
  }, [selectedDate, navigate])

  const handleToggleAllArticles = useCallback(() => {
    if (allArticles) {
      navigate({
        search: (old) => ({ ...old, view: undefined, date: undefined }),
      })
    } else {
      navigate({
        search: (old) => ({ ...old, view: "all" as const }),
      })
    }
  }, [allArticles, navigate])

  useEffect(() => {
    articlesRef.current = filteredArticles
  }, [filteredArticles])

  const handleKeyboardHide = useCallback(
    (articleId: string) => {
      hideArticle(articleId)
    },
    [hideArticle],
  )

  const handleKeyboardSave = useCallback(
    (articleId: string) => {
      const article = articlesRef.current.find((a) => a.id === articleId)
      if (!article) return
      if (isInReadList(articleId)) {
        removeFromReadList(articleId)
      } else {
        addToReadList(article)
        hideArticle(articleId)
        swipeableCardReferences.current.get(articleId)?.triggerRemoval()
      }
    },
    [isInReadList, removeFromReadList, addToReadList, hideArticle],
  )

  const getFocusedArticleId = useCallback(
    () => focusedArticleRef.current,
    [],
  )

  const getHoveredArticleId = useCallback(
    () => hoveredArticleRef.current,
    [],
  )

  useArticleKeyboardShortcuts({
    onHide: handleKeyboardHide,
    onSave: handleKeyboardSave,
    getFocusedArticleId,
    getHoveredArticleId,
  })

  const createInteractionRef = useCallback(
    (articleId: string) => {
      return (node: HTMLElement | null) => {
        if (node) {
          const handleEnter = () => { hoveredArticleRef.current = articleId }
          const handleLeave = () => { hoveredArticleRef.current = undefined }
          const handleFocus = () => { focusedArticleRef.current = articleId }
          const handleBlur = () => { focusedArticleRef.current = undefined }
          node.addEventListener("mouseenter", handleEnter)
          node.addEventListener("mouseleave", handleLeave)
          node.addEventListener("focusin", handleFocus)
          node.addEventListener("focusout", handleBlur)
        }
      }
    },
    [],
  )

  const renderActions = useCallback(
    (article: NormalizedArticle) => {
      if (showHidden && isHidden(article.id)) {
        return createElement(HiddenArticleActions, {
          onUnhide: () => unhideArticle(article.id),
        })
      }
      return createElement(ArticleActionButtons, {
        onHide: () => hideArticle(article.id),
        onSave: () => {
          if (isInReadList(article.id)) {
            removeFromReadList(article.id)
          } else {
            addToReadList(article)
            hideArticle(article.id)
            swipeableCardReferences.current.get(article.id)?.triggerRemoval()
          }
        },
        isSaved: isInReadList(article.id),
      })
    },
    [
      showHidden, isHidden, unhideArticle, hideArticle,
      isInReadList, removeFromReadList, addToReadList,
    ],
  )

  const renderArticleWrapper = useCallback(
    (article: NormalizedArticle, children: ReactNode) => {
      const hoverDiv = createElement(
        "div",
        { ref: createInteractionRef(article.id) },
        children,
      )
      return createElement(
        SwipeableCard,
        {
          key: article.id,
          ref: (handle: SwipeableCardHandle | null) => {
            if (handle) {
              swipeableCardReferences.current.set(article.id, handle)
            } else {
              swipeableCardReferences.current.delete(article.id)
            }
          },
          swipeRight: {
            bgClassName: "bg-amber-100 dark:bg-amber-900/30",
            icon: createElement(
              "span",
              { className: "text-amber-700 dark:text-amber-400", "aria-hidden": "true" },
              createElement(EyeOff, { className: "size-5" }),
            ),
            onAction: () => hideArticle(article.id),
          },
          swipeLeft: {
            bgClassName: "bg-blue-100 dark:bg-blue-900/30",
            icon: createElement(
              "span",
              { className: "text-blue-700 dark:text-blue-400", "aria-hidden": "true" },
              createElement(BookmarkPlus, { className: "size-5" }),
            ),
            onAction: () => {
              if (isInReadList(article.id)) {
                removeFromReadList(article.id)
              } else {
                addToReadList(article)
                hideArticle(article.id)
              }
            },
          },
        },
        hoverDiv,
      )
    },
    [hideArticle, isInReadList, removeFromReadList, addToReadList, createInteractionRef],
  )

  const handleToggleShowHidden = useCallback(() => {
    navigate({
      search: (old) => ({ ...old, hidden: !showHidden || undefined }),
    })
  }, [navigate, showHidden])

  const filterBarProps: FilterBarProps = useMemo(() => ({
    showHidden,
    onToggleShowHidden: handleToggleShowHidden,
    searchQuery,
    onSearchChange: (value: string) => {
      navigate({
        search: (old) => ({ ...old, q: value || undefined }),
      })
    },
    selectedDate,
    allArticles,
    isToday,
    onPrev: handlePreviousDay,
    onNext: handleNextDay,
    onToggleAllArticles: handleToggleAllArticles,
    articleCount,
    hiddenCount,
  }), [
    showHidden, handleToggleShowHidden, searchQuery, selectedDate,
    allArticles, isToday, handlePreviousDay, handleNextDay,
    handleToggleAllArticles, articleCount, hiddenCount, navigate,
  ])

  const emptyMessage = !allArticles && !loading
    ? "No articles for this day."
    : undefined

  const feedListProps: FeedListProps = useMemo(() => ({
    filteredArticles,
    loading,
    errors,
    hiddenIds,
    showHidden,
    renderActions,
    renderWrapper: renderArticleWrapper,
    emptyMessage,
    onRefresh: refresh,
  }), [
    filteredArticles, loading, errors, hiddenIds,
    showHidden, renderActions, renderArticleWrapper, emptyMessage, refresh,
  ])

  return { filterBarProps, feedListProps, lastRefreshedAt }
}
