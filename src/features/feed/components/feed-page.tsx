import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { FeedList } from "./feed-list"
import { FilterBar } from "./filter-bar"
import { RefreshButton } from "./refresh-button"
import { useFeedData } from "../hooks/use-feed-data"
import { filterArticles } from "../utils/filter-articles"

import type { NormalizedArticle } from "@/features/connectors/types"

import { ArticleActionButtons } from "@/features/article-actions/components/article-action-buttons"
import { HiddenArticleActions } from "@/features/article-actions/components/hidden-article-actions"
import { SwipeableCard } from "@/features/article-actions/components/swipeable-card"
import { useArticleKeyboardShortcuts } from "@/features/article-actions/hooks/use-article-keyboard-shortcuts"
import { useArticleState } from "@/features/article-actions/hooks/use-article-state"
import { connectors } from "@/features/connectors/registry"
import { useFeedPreferences } from "@/features/feed-config/hooks/use-feed-preferences"

export function FeedPage() {
  const { isFeedEnabled } = useFeedPreferences()
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

  const [enabledSources, setEnabledSources] = useState<Set<string>>(
    () => new Set(connectors.map((c) => c.id)),
  )
  const [language, setLanguage] = useState<"all" | "de" | "en">("all")
  const [showHidden, setShowHidden] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredArticles = useMemo(
    () =>
      filterArticles(articles, {
        enabledSources,
        language,
        showHidden,
        hiddenIds,
        searchQuery,
      }),
    [articles, enabledSources, language, showHidden, hiddenIds, searchQuery],
  )

  articlesRef.current = filteredArticles

  const handleToggleSource = useCallback((sourceId: string) => {
    setEnabledSources((previous) => {
      const next = new Set(previous)
      if (next.has(sourceId)) {
        next.delete(sourceId)
      } else {
        next.add(sourceId)
      }
      return next
    })
  }, [])

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
        enabledSources={enabledSources}
        onToggleSource={handleToggleSource}
        language={language}
        onLanguageChange={setLanguage}
        showHidden={showHidden}
        onToggleShowHidden={() => setShowHidden((previous) => !previous)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        refreshButton={<RefreshButton loading={loading} onClick={() => void refresh()} />}
      />

      <FeedList
        articles={filteredArticles}
        loading={loading}
        errors={errors}
        hiddenIds={hiddenIds}
        showHidden={showHidden}
        renderActions={renderActions}
        renderWrapper={renderArticleWrapper}
      />
    </div>
  )
}
