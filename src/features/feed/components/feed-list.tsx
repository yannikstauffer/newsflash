import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { ArticleCard } from "./article-card"

import type { NormalizedArticle } from "@/features/connectors/types"
import type { ReactNode } from "react"

import { useLazyList } from "@/hooks/use-lazy-list"

interface FeedListProps {
  readonly articles: NormalizedArticle[]
  readonly loading: boolean
  readonly errors: string[]
  readonly hiddenIds: string[]
  readonly showHidden: boolean
  readonly renderActions?: (article: NormalizedArticle) => ReactNode
  readonly renderWrapper?: (article: NormalizedArticle, children: ReactNode) => ReactNode
  readonly emptyMessage?: string
}

export function FeedList({
  articles,
  loading,
  errors,
  hiddenIds,
  showHidden,
  renderActions,
  renderWrapper,
  emptyMessage,
}: FeedListProps) {
  const { t } = useTranslation()
  const { visibleItems, sentinelRef } = useLazyList(articles)
  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds])

  if (loading && articles.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-label={t("feed.loadingLabel")}
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">{t("feed.loading")}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {errors.length > 0 && (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium">{t("feed.loadError")}</p>
          <ul className="mt-1 list-inside list-disc">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {articles.length === 0 && !loading && (
        <p className="py-12 text-center text-muted-foreground">
          {emptyMessage ?? t("feed.empty")}
        </p>
      )}

      {visibleItems.map((article) => {
        const card = (
          <ArticleCard
            key={article.id}
            article={article}
            dimmed={showHidden && hiddenSet.has(article.id)}
            actions={renderActions?.(article)}
          />
        )
        return renderWrapper ? renderWrapper(article, card) : card
      })}

      <div ref={sentinelRef} />
    </div>
  )
}
