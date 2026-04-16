import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { articleCardVariants } from "./card-variants"
import { formatAbsoluteTime, formatShortTime } from "../utils/format-time"

import type { NormalizedArticle } from "@/features/connectors/types"
import type { ReactNode } from "react"

interface ArticleCardProps {
  readonly article: NormalizedArticle
  readonly dimmed?: boolean
  readonly actions?: ReactNode
}

export function ArticleCard({ article, dimmed, actions }: ArticleCardProps) {
  const { i18n } = useTranslation()
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const handleImageError = useCallback(() => {
    setFailedUrl((current) => current ?? article.imageUrl ?? null)
  }, [article.imageUrl])

  const imageError = failedUrl === article.imageUrl
  const hasImage = Boolean(article.imageUrl) && !imageError

  return (
    <article
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- WCAG 2.1.1: focusable for keyboard shortcuts
      tabIndex={0}
      className={articleCardVariants({ hasImage, dimmed: Boolean(dimmed) })}
    >
      {article.imageUrl && !imageError && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          width={96}
          height={96}
          className="size-24 shrink-0 self-center rounded-lg object-cover"
          onError={handleImageError}
        />
      )}
      <div className="min-w-0 text-left">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs lowercase text-muted-foreground">
          <span className="font-medium">{article.source}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={article.publishedAt.toISOString()}>
            <span className="hidden md:inline">
              {formatAbsoluteTime(article.publishedAt, i18n.language)}
            </span>
            <span className="md:hidden">
              {formatShortTime(article.publishedAt, i18n.language)}
            </span>
          </time>
          {article.category && (
            <span className="hidden md:inline">
              <span aria-hidden="true">&middot; </span>
              {article.category}
            </span>
          )}
        </div>
        <div className="md:flex md:h-[92px] md:flex-col">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex-none"
          >
            <h3 className="mb-1 line-clamp-4 text-base font-medium text-foreground md:line-clamp-2 md:font-semibold">
              {article.title}
            </h3>
          </a>
          {article.description && (
            <p className="hidden text-sm text-muted-foreground md:block md:flex-1 md:overflow-hidden md:[mask-image:linear-gradient(to_bottom,black_calc(100%-0.75rem),transparent)]">
              {article.description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="absolute right-2 top-2">{actions}</div>
      )}
    </article>
  )
}
