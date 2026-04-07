import { useCallback, useEffect, useRef, useState } from "react"

import type { NormalizedArticle } from "@/features/connectors/types"

import { feedProxyPath } from "@/config/feeds"
import { fetchFeed } from "@/features/connectors/fetch-feed"
import { connectors } from "@/features/connectors/registry"
import * as articleCache from "@/lib/article-cache"

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
  lastRefreshedAt: Date | null
}

let feedCache: FeedCache | null = null

export function clearFeedCache(): void {
  feedCache = null
}

function deduplicateArticles(articles: NormalizedArticle[]): NormalizedArticle[] {
  const seenKeys = new Set<string>()
  const seenLinks = new Set<string>()
  return articles.filter((article) => {
    const key = `${article.title}|${article.publishedAt.getTime()}`
    if (seenKeys.has(key) || seenLinks.has(article.link)) {
      return false
    }
    seenKeys.add(key)
    seenLinks.add(article.link)
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
  const sorted = sortChronologically(allArticles)
  const deduplicated = deduplicateArticles(sorted)

  return { articles: deduplicated, errors: fetchErrors }
}

function getFullyEnabledSources(
  isFeedEnabled: (feedId: string) => boolean,
): Set<string> {
  const sources = new Set<string>()
  for (const connector of connectors) {
    if (connector.feeds.every((feed) => isFeedEnabled(feed.id))) {
      sources.add(connector.id)
    }
  }
  return sources
}

function filterByEnabledSources(
  articles: NormalizedArticle[],
  enabledSources: Set<string>,
): NormalizedArticle[] {
  return articles.filter((article) => enabledSources.has(article.source))
}

function mergeAndDeduplicate(
  networkArticles: NormalizedArticle[],
  cachedArticles: NormalizedArticle[],
): NormalizedArticle[] {
  const merged = [...networkArticles, ...cachedArticles]
  const sorted = sortChronologically(merged)
  return deduplicateArticles(sorted)
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
  const shouldSkipInitialFetch = useRef(
    feedCache !== null && feedCache.lastRefreshedAt !== null,
  )

  const applyFetchResult = useCallback(
    (
      result: { articles: NormalizedArticle[]; errors: string[] },
      cachedArticles: NormalizedArticle[],
    ) => {
      const now = new Date()
      const merged = mergeAndDeduplicate(result.articles, cachedArticles)
      feedCache = {
        articles: merged,
        errors: result.errors,
        lastRefreshedAt: now,
      }
      setArticles(merged)
      setErrors(result.errors)
      setLastRefreshedAt(now)
      setLoading(false)
      if (result.articles.length > 0) {
        articleCache.upsertMany(result.articles).catch(() => {})
      }
    },
    [],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setErrors([])
    const enabledSources = getFullyEnabledSources(isFeedEnabled)
    const [result, cached] = await Promise.all([
      fetchAllFeeds(isFeedEnabled),
      articleCache.getAll().catch(() => [] as NormalizedArticle[]),
    ])
    applyFetchResult(result, filterByEnabledSources(cached, enabledSources))
  }, [isFeedEnabled, applyFetchResult])

  useEffect(() => {
    if (shouldSkipInitialFetch.current) {
      shouldSkipInitialFetch.current = false
      return
    }
    let cancelled = false

    async function load(): Promise<void> {
      // L2: evict stale entries then read from IndexedDB
      const enabledSources = getFullyEnabledSources(isFeedEnabled)
      await articleCache.evict().catch(() => {})
      const allCached = await articleCache.getAll().catch(() => [] as NormalizedArticle[])
      const cachedArticles = filterByEnabledSources(allCached, enabledSources)

      if (cancelled) return

      if (cachedArticles.length > 0) {
        const sorted = sortChronologically(cachedArticles)
        const deduplicated = deduplicateArticles(sorted)
        feedCache = {
          articles: deduplicated,
          errors: [],
          lastRefreshedAt: null,
        }
        setArticles(deduplicated)
        setErrors([])
        setLastRefreshedAt(null)
        setLoading(false)
      }

      // L3: always fetch from network in background
      const result = await fetchAllFeeds(isFeedEnabled)
      if (!cancelled) {
        applyFetchResult(result, cachedArticles)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [isFeedEnabled, applyFetchResult])

  return { articles, loading, errors, lastRefreshedAt, refresh }
}
