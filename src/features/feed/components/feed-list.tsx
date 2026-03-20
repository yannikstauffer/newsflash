import { Loader2 } from "lucide-react"

import { ArticleCard } from "./article-card"

import type { NormalizedArticle } from "@/features/connectors/types"
import type { ReactNode } from "react"

interface FeedListProps {
  readonly articles: NormalizedArticle[]
  readonly loading: boolean
  readonly errors: string[]
  readonly hiddenIds: string[]
  readonly showHidden: boolean
  readonly renderActions?: (article: NormalizedArticle) => ReactNode
  readonly renderWrapper?: (article: NormalizedArticle, children: ReactNode) => ReactNode
}

export function FeedList({
  articles,
  loading,
  errors,
  hiddenIds,
  showHidden,
  renderActions,
  renderWrapper,
}: FeedListProps) {
  const hiddenSet = new Set(hiddenIds)

  if (loading && articles.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-label="Loading feeds"
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading feeds...</span>
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
          <p className="font-medium">{"Some feeds failed to load:"}</p>
          <ul className="mt-1 list-inside list-disc">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {articles.length === 0 && !loading && (
        <p className="py-12 text-center text-muted-foreground">
          {"No articles found. Try adjusting your filters."}
        </p>
      )}

      {articles.map((article) => {
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
    </div>
  )
}
