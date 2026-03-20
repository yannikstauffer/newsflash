import { formatRelativeTime } from "../utils/format-time"

import type { NormalizedArticle } from "@/features/connectors/types"
import type { ReactNode } from "react"

interface ArticleCardProps {
  readonly article: NormalizedArticle
  readonly dimmed?: boolean
  readonly actions?: ReactNode
}

export function ArticleCard({ article, dimmed, actions }: ArticleCardProps) {
  return (
    <article
      className={`group relative grid ${article.imageUrl ? "grid-cols-[auto_1fr]" : "grid-cols-1"} gap-3 rounded-lg border border-border p-3 transition-all duration-150 hover:bg-muted/50 hover:shadow-sm md:gap-4 md:p-4 ${
        dimmed ? "opacity-50" : ""
      }`}
    >
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          width={96}
          height={64}
          className="size-16 shrink-0 self-center rounded-lg object-cover md:h-20 md:w-24"
        />
      )}
      <div className="min-w-0 text-left">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <h3 className="mb-1 line-clamp-2 text-base font-semibold text-foreground">
            {article.title}
          </h3>
        </a>
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">{article.source}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {formatRelativeTime(article.publishedAt)}
          </time>
          {article.category && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{article.category}</span>
            </>
          )}
        </div>
        {article.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {article.description}
          </p>
        )}
      </div>
      {actions && (
        <div className="absolute right-2 top-2">{actions}</div>
      )}
    </article>
  )
}
