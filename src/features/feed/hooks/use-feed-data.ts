import { useCallback, useEffect, useRef, useState } from "react"

import type { NormalizedArticle } from "@/features/connectors/types"

import { feedProxyPath } from "@/config/feeds"
import { fetchFeed } from "@/features/connectors/fetch-feed"
import { connectors } from "@/features/connectors/registry"

interface FeedDataResult {
  articles: NormalizedArticle[]
  loading: boolean
  errors: string[]
  lastRefreshedAt: Date | null
  refresh: () => Promise<void>
}

interface FeedCache {
  articles: NormalizedArticle[]
  errors: string[]
  lastRefreshedAt: Date
}

let feedCache: FeedCache | null = null

export function clearFeedCache(): void {
  feedCache = null
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

async function fetchAllFeeds(
  isFeedEnabled: (feedId: string) => boolean,
): Promise<{ articles: NormalizedArticle[]; errors: string[] }> {
  const fetchErrors: string[] = []

  const feedPromises = connectors.flatMap((connector) =>
    connector.feeds
      .filter((feed) => isFeedEnabled(feed.id))
      .map(async (feed): Promise<NormalizedArticle[]> => {
        try {
          const xml = await fetchFeed(feedProxyPath(feed.id))
          return connector.parse(xml)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error"
          fetchErrors.push(`${connector.name} (${feed.name}): ${message}`)
          return []
        }
      }),
  )

  const results = await Promise.all(feedPromises)
  const allArticles = results.flat()
  const deduplicated = deduplicateArticles(allArticles)
  const sorted = sortChronologically(deduplicated)

  return { articles: sorted, errors: fetchErrors }
}

export function useFeedData(
  isFeedEnabled: (feedId: string) => boolean,
): FeedDataResult {
  const [articles, setArticles] = useState<NormalizedArticle[]>(
    () => feedCache?.articles ?? [],
  )
  const [loading, setLoading] = useState(() => feedCache === null)
  const [errors, setErrors] = useState<string[]>(
    () => feedCache?.errors ?? [],
  )
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(
    () => feedCache?.lastRefreshedAt ?? null,
  )
  const shouldSkipInitialFetch = useRef(feedCache !== null)

  const applyFetchResult = useCallback(
    (result: { articles: NormalizedArticle[]; errors: string[] }) => {
      const now = new Date()
      feedCache = {
        articles: result.articles,
        errors: result.errors,
        lastRefreshedAt: now,
      }
      setArticles(result.articles)
      setErrors(result.errors)
      setLastRefreshedAt(now)
      setLoading(false)
    },
    [],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setErrors([])
    const result = await fetchAllFeeds(isFeedEnabled)
    applyFetchResult(result)
  }, [isFeedEnabled, applyFetchResult])

  useEffect(() => {
    if (shouldSkipInitialFetch.current) {
      shouldSkipInitialFetch.current = false
      return
    }
    let cancelled = false
    fetchAllFeeds(isFeedEnabled).then((result) => {
      if (!cancelled) {
        applyFetchResult(result)
      }
    })
    return () => {
      cancelled = true
    }
  }, [isFeedEnabled, applyFetchResult])

  return { articles, loading, errors, lastRefreshedAt, refresh }
}
