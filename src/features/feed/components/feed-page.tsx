import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { FeedList } from "./feed-list"
import { FilterBar } from "./filter-bar"
import { useFeedData } from "../hooks/use-feed-data"
import { filterArticles } from "../utils/filter-articles"
import { filterByDay } from "../utils/filter-by-day"

import type { NormalizedArticle } from "@/features/connectors/types"

import { ArticleActionButtons } from "@/features/article-actions/components/article-action-buttons"
import { HiddenArticleActions } from "@/features/article-actions/components/hidden-article-actions"
import { SwipeableCard } from "@/features/article-actions/components/swipeable-card"
import { useArticleKeyboardShortcuts } from "@/features/article-actions/hooks/use-article-keyboard-shortcuts"
import { useArticleState } from "@/features/article-actions/hooks/use-article-state"
import { useFeedPreferences } from "@/features/feed-config/hooks/use-feed-preferences"

export function FeedPage() {
  const { isFeedEnabled, language } = useFeedPreferences()
  const { articles, loading, errors, refresh } = useFeedData(isFeedEnabled)
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
  const articlesRef = useRef<NormalizedArticle[]>([])

  const [showHidden, setShowHidden] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [allArticles, setAllArticles] = useState(false)

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredArticles = useMemo(() => {
    const filtered = filterArticles(articles, {
      isFeedEnabled,
      language,
      showHidden,
      hiddenIds,
      searchQuery,
    })
    if (allArticles) {
      return filtered
    }
    return filterByDay(filtered, selectedDate)
  }, [articles, isFeedEnabled, language, showHidden, hiddenIds, searchQuery, allArticles, selectedDate])

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

  articlesRef.current = filteredArticles

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

  const getHoveredArticleId = useCallback(
    () => hoveredArticleRef.current,
    [],
  )

  useArticleKeyboardShortcuts({
    onHide: handleKeyboardHide,
    onSave: handleKeyboardSave,
    getHoveredArticleId,
  })

  const renderActions = useCallback(
    (article: NormalizedArticle) => {
      if (showHidden && isHidden(article.id)) {
        return <HiddenArticleActions onUnhide={() => unhideArticle(article.id)} />
      }
      return (
        <ArticleActionButtons
          onHide={() => hideArticle(article.id)}
          onSave={() => {
            if (isInReadList(article.id)) {
              removeFromReadList(article.id)
            } else {
              addToReadList(article)
            }
          }}
          isSaved={isInReadList(article.id)}
        />
      )
    },
    [showHidden, isHidden, unhideArticle, hideArticle, isInReadList, removeFromReadList, addToReadList],
  )

  const renderArticleWrapper = useCallback(
    (article: NormalizedArticle, children: React.ReactNode) => (
      <SwipeableCard
        key={article.id}
        onSwipeRight={() => hideArticle(article.id)}
        onSwipeLeft={() => {
          if (isInReadList(article.id)) {
            removeFromReadList(article.id)
          } else {
            addToReadList(article)
          }
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          onMouseEnter={() => { hoveredArticleRef.current = article.id }}
          onMouseLeave={() => { hoveredArticleRef.current = undefined }}
        >
          {children}
        </div>
      </SwipeableCard>
    ),
    [hideArticle, isInReadList, removeFromReadList, addToReadList],
  )

  return (
    <div className="space-y-4">
      <FilterBar
        showHidden={showHidden}
        onToggleShowHidden={() => setShowHidden((previous) => !previous)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDate={selectedDate}
        allArticles={allArticles}
        isToday={isToday}
        onPrev={handlePreviousDay}
        onNext={handleNextDay}
        onToggleAllArticles={handleToggleAllArticles}
      />

      <FeedList
        articles={filteredArticles}
        loading={loading}
        errors={errors}
        hiddenIds={hiddenIds}
        showHidden={showHidden}
        renderActions={renderActions}
        renderWrapper={renderArticleWrapper}
        emptyMessage={
          !allArticles && !loading
            ? "No articles for this day."
            : undefined
        }
      />
    </div>
  )
}
