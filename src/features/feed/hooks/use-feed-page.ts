import { Bookmark, EyeOff } from "lucide-react"
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

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
import { useFeedPreferences } from "@/features/feed-config/hooks/use-feed-preferences"

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
  readonly lastRefreshedAt: Date | null
  readonly articleCount: number
  readonly hiddenCount: number
  readonly onHideAll: () => void
  readonly visibleArticleIds: string[]
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
}

export function useFeedPage(): UseFeedPageResult {
  const { t } = useTranslation()
  const { isFeedEnabled } = useFeedPreferences()
  const { articles, loading, errors, lastRefreshedAt } = useFeedData(isFeedEnabled)
  const {
    hiddenIds,
    isHidden,
    isInReadList,
    hideArticle,
    unhideArticle,
    addToReadList,
    hideArticles,
  } = useArticleState()

  const hoveredArticleRef = useRef<string | undefined>(undefined)
  const focusedArticleRef = useRef<string | undefined>(undefined)
  const articlesRef = useRef<NormalizedArticle[]>([])
  const cardReferencesMap = useRef<Map<string, SwipeableCardHandle>>(new Map())

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
    })
    if (allArticles) {
      return filtered
    }
    return filterByDay(filtered, selectedDate)
  }, [
    articles, isFeedEnabled, showHidden,
    hiddenIds, searchQuery, allArticles, selectedDate,
  ])

  const { articleCount, hiddenCount, visibleArticleIds } = useMemo(() => {
    const hiddenSet = new Set(hiddenIds)
    const nonHidden = filteredArticles.filter((a) => !hiddenSet.has(a.id))
    const hidden = filteredArticles.length - nonHidden.length
    if (showHidden) {
      return {
        articleCount: nonHidden.length,
        hiddenCount: hidden,
        visibleArticleIds: nonHidden.map((a) => a.id),
      }
    }
    return {
      articleCount: filteredArticles.length,
      hiddenCount: 0,
      visibleArticleIds: filteredArticles.map((a) => a.id),
    }
  }, [filteredArticles, hiddenIds, showHidden])

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
      const cardHandle = cardReferencesMap.current.get(articleId)
      if (cardHandle) {
        cardHandle.triggerRemoval("right")
      } else {
        hideArticle(articleId)
      }
    },
    [hideArticle],
  )

  const handleKeyboardSave = useCallback(
    (articleId: string) => {
      const article = articlesRef.current.find((a) => a.id === articleId)
      if (!article) return
      if (isInReadList(articleId)) return
      const cardHandle = cardReferencesMap.current.get(articleId)
      if (cardHandle) {
        cardHandle.triggerRemoval("left")
      } else {
        addToReadList(article)
        hideArticle(articleId)
      }
    },
    [isInReadList, addToReadList, hideArticle],
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

  const handleHideAll = useCallback(() => {
    hideArticles(visibleArticleIds)
  }, [hideArticles, visibleArticleIds])

  const renderActions = useCallback(
    (article: NormalizedArticle) => {
      if (showHidden && isHidden(article.id)) {
        return createElement(HiddenArticleActions, {
          onUnhide: () => unhideArticle(article.id),
        })
      }
      return createElement(ArticleActionButtons, {
        onHide: () => {
          const cardHandle = cardReferencesMap.current.get(article.id)
          if (cardHandle) {
            cardHandle.triggerRemoval()
          } else {
            hideArticle(article.id)
          }
        },
        onSave: () => {
          if (isInReadList(article.id)) return
          const cardHandle = cardReferencesMap.current.get(article.id)
          if (cardHandle) {
            cardHandle.triggerRemoval()
          } else {
            addToReadList(article)
            hideArticle(article.id)
          }
        },
        isSaved: isInReadList(article.id),
      })
    },
    [
      showHidden, isHidden, unhideArticle, hideArticle,
      isInReadList, addToReadList,
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
              cardReferencesMap.current.set(article.id, handle)
            } else {
              cardReferencesMap.current.delete(article.id)
            }
          },
          swipeRight: {
            bgClassName: "bg-amber-100 dark:bg-amber-900/30",
            icon: createElement("span", {
              className: "text-amber-700 dark:text-amber-400",
              "aria-hidden": "true",
            }, createElement(EyeOff, { className: "size-5" })),
            onAction: () => hideArticle(article.id),
          },
          swipeLeft: {
            bgClassName: "bg-blue-100 dark:bg-blue-900/30",
            icon: createElement("span", {
              className: "text-blue-700 dark:text-blue-400",
              "aria-hidden": "true",
            }, createElement(Bookmark, { className: "size-5" })),
            onAction: () => {
              addToReadList(article)
              hideArticle(article.id)
            },
          },
          children: hoverDiv,
        },
      )
    },
    [hideArticle, addToReadList, createInteractionRef],
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
    lastRefreshedAt,
    articleCount,
    hiddenCount,
    onHideAll: handleHideAll,
    visibleArticleIds,
  }), [
    showHidden, handleToggleShowHidden, searchQuery, selectedDate,
    allArticles, isToday, handlePreviousDay, handleNextDay,
    handleToggleAllArticles, lastRefreshedAt, articleCount, hiddenCount,
    handleHideAll, visibleArticleIds,
  ])

  const emptyMessage = !allArticles && !loading
    ? t("feed.emptyDay")
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

  return { filterBarProps, feedListProps }
}
