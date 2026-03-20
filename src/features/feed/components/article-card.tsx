import { formatAbsoluteTime, formatShortTime } from "../utils/format-time"

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
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- WCAG 2.1.1: focusable for keyboard shortcuts
      tabIndex={0}
      className={`group relative grid ${article.imageUrl ? "grid-cols-[auto_1fr]" : "grid-cols-1"} gap-3 rounded-lg bg-card p-3 shadow-sm transition-all duration-150 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] md:gap-4 md:p-4 ${
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
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs lowercase text-muted-foreground">
          <span className="font-medium">{article.source}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={article.publishedAt.toISOString()}>
            <span className="hidden md:inline">
              {formatAbsoluteTime(article.publishedAt)}
            </span>
            <span className="md:hidden">
              {formatShortTime(article.publishedAt)}
            </span>
          </time>
          {article.category && (
            <span className="hidden md:inline">
              <span aria-hidden="true">&middot; </span>
              {article.category}
            </span>
          )}
        </div>
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
