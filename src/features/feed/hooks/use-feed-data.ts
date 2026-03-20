import { useCallback, useState } from "react"

import type { NormalizedArticle } from "@/features/connectors/types"

import { fetchFeed } from "@/features/connectors/fetch-feed"
import { connectors } from "@/features/connectors/registry"

interface FeedDataResult {
  articles: NormalizedArticle[]
  loading: boolean
  errors: string[]
  refresh: () => Promise<void>
}

function deduplicateArticles(articles: NormalizedArticle[]): NormalizedArticle[] {
  const seen = new Set<string>()
  return articles.filter((article) => {
    const key = `${article.title}|${article.publishedAt.getTime()}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function sortChronologically(articles: NormalizedArticle[]): NormalizedArticle[] {
  return [...articles].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  )
}

export function useFeedData(
  isFeedEnabled: (feedId: string) => boolean,
): FeedDataResult {
  const [articles, setArticles] = useState<NormalizedArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setErrors([])

    const allArticles: NormalizedArticle[] = []
    const fetchErrors: string[] = []

    const feedPromises = connectors.flatMap((connector) =>
      connector.feeds
        .filter((feed) => isFeedEnabled(feed.id))
        .map(async (feed) => {
          try {
            const xml = await fetchFeed(feed.proxyPath)
            const parsed = connector.parse(xml)
            allArticles.push(...parsed)
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown error"
            fetchErrors.push(`${connector.name} (${feed.name}): ${message}`)
          }
        }),
    )

    await Promise.all(feedPromises)

    const deduplicated = deduplicateArticles(allArticles)
    const sorted = sortChronologically(deduplicated)

    setArticles(sorted)
    setErrors(fetchErrors)
    setLoading(false)
  }, [isFeedEnabled])

  return { articles, loading, errors, refresh }
}
