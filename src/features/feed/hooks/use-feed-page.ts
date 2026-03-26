import { BookmarkPlus, EyeOff } from "lucide-react"
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useFeedData } from "./use-feed-data"
import { filterArticles } from "../utils/filter-articles"
import { filterByDay } from "../utils/filter-by-day"

import type { NormalizedArticle } from "@/features/connectors/types"
import type { ReactNode } from "react"

import {
  ArticleActionButtons,
  HiddenArticleActions,
  SwipeableCard,
  useArticleKeyboardShortcuts,
  useArticleState,
} from "@/features/article-actions"
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
}

interface UseFeedPageResult {
  readonly filterBarProps: FilterBarProps
  readonly feedListProps: FeedListProps
  readonly lastRefreshedAt: Date | null
}

export function useFeedPage(): UseFeedPageResult {
  const { isFeedEnabled } = useFeedPreferences()
  const { isFilterEnabled } = useFilterPreferences()
  const { articles, loading, errors, lastRefreshedAt } = useFeedData(isFeedEnabled)
  const {
    hiddenIds,
    isHidden,
    isInReadList,
    hideArticle,
    unhideArticle,
    addToReadList,
    removeFromReadList,
  } = useArticleState()

  const hoveredArticleRef = useRef<string | undefined>(undefined)
  const focusedArticleRef = useRef<string | undefined>(undefined)
  const articlesRef = useRef<NormalizedArticle[]>([])

  const [showHidden, setShowHidden] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [allArticles, setAllArticles] = useState(false)

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

  const isToday = useMemo(() => {
    const today = new Date()
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    )
  }, [selectedDate])

  const handlePreviousDay = useCallback(() => {
    setSelectedDate((previous) => {
      const next = new Date(previous)
      next.setDate(next.getDate() - 1)
      return next
    })
  }, [])

  const handleNextDay = useCallback(() => {
    setSelectedDate((previous) => {
      const next = new Date(previous)
      next.setDate(next.getDate() + 1)
      return next
    })
  }, [])

  const handleToggleAllArticles = useCallback(() => {
    setAllArticles((previous) => {
      if (previous) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setSelectedDate(today)
      }
      return !previous
    })
  }, [])

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
      }
    },
    [isInReadList, removeFromReadList, addToReadList],
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
    setShowHidden((previous) => !previous)
  }, [])

  const filterBarProps: FilterBarProps = useMemo(() => ({
    showHidden,
    onToggleShowHidden: handleToggleShowHidden,
    searchQuery,
    onSearchChange: setSearchQuery,
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
    handleToggleAllArticles, articleCount, hiddenCount,
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
  }), [
    filteredArticles, loading, errors, hiddenIds,
    showHidden, renderActions, renderArticleWrapper, emptyMessage,
  ])

  return { filterBarProps, feedListProps, lastRefreshedAt }
}
