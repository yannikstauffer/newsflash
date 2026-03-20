import { BookmarkMinus } from "lucide-react"

import { useArticleState } from "../hooks/use-article-state"

import type { NormalizedArticle } from "@/features/connectors/types"

import { Button } from "@/components/ui/button"
import { ArticleCard } from "@/features/feed/components/article-card"

export function ReadListPage() {
  const { readListArticles, removeFromReadList } = useArticleState()

  if (readListArticles.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {"No saved articles yet. Swipe left or click the bookmark icon to save articles."}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {readListArticles.map((article: NormalizedArticle) => (
        <ArticleCard
          key={article.id}
          article={article}
          actions={
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                removeFromReadList(article.id)
              }}
              aria-label="Remove from read list"
              className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
            >
              <BookmarkMinus className="size-3.5" />
            </Button>
          }
        />
      ))}
    </div>
  )
}
