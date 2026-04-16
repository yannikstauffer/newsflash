import { useCallback, useEffect, useRef, useState } from "react"

import type { NormalizedArticle } from "@/features/connectors/types"

import { connectors } from "@/features/connectors/registry"
import * as articleCache from "@/lib/article-cache"
import { fetchAndParseAllFeeds } from "@/lib/feed-pipeline"
import { extractLeadingImage } from "@/utils/extract-leading-image"
import { stripHtml } from "@/utils/strip-html"

interface FeedDataResult {
  articles: NormalizedArticle[]
  loading: boolean
  errors: string[]
  lastRefreshedAt: Date | null
  refresh: () => Promise<void>
  pendingCount: number
  acceptPending: () => void
}

interface FeedCache {
  articles: NormalizedArticle[]
  errors: string[]
  lastRefreshedAt: Date | null
}

const LS_LAST_REFRESHED_KEY = "newsflash:last-refreshed-at"

let feedCache: FeedCache | null = null

export function clearFeedCache(): void {
  feedCache = null
}

function ensureProcessed(articles: NormalizedArticle[]): NormalizedArticle[] {
  return articles.map((article) => {
    if (article.processed === true) {
      return article
    }
    // Legacy entries (pre-flag) were already processed by the main thread when
    // they were written. Trust them and only stamp the flag — re-running
    // stripHtml on already-decoded text could corrupt descriptions containing
    // literal `<...>` characters.
    if (article.processed === undefined) {
      return { ...article, processed: true }
    }
    const { imageUrl: inlineImage, html: cleanedHtml } =
      extractLeadingImage(article.description)
    return {
      ...article,
      description: stripHtml(cleanedHtml),
      imageUrl: article.imageUrl ?? inlineImage,
      processed: true,
    }
  })
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

function getEnabledFeedIds(
  isFeedEnabled: (feedId: string) => boolean,
): string[] {
  return connectors.flatMap((connector) =>
    connector.feeds
      .filter((feed) => isFeedEnabled(feed.id))
      .map((feed) => feed.id),
  )
}

async function fetchAllFeeds(
  isFeedEnabled: (feedId: string) => boolean,
): Promise<{ articles: NormalizedArticle[]; errors: string[] }> {
  const feedIds = getEnabledFeedIds(isFeedEnabled)
  const result = await fetchAndParseAllFeeds(feedIds)
  const sorted = sortChronologically(result.articles)
  const deduplicated = deduplicateArticles(sorted)

  return { articles: deduplicated, errors: result.errors }
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

export function hasArticleListChanged(
  previous: NormalizedArticle[],
  next: NormalizedArticle[],
): boolean {
  if (previous.length !== next.length) return true
  return previous.some((article, index) => article.id !== next[index].id)
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
    () => {
      if (feedCache?.lastRefreshedAt) return feedCache.lastRefreshedAt
      try {
        const raw = localStorage.getItem(LS_LAST_REFRESHED_KEY)
        if (!raw) return null
        const date = new Date(raw)
        return Number.isNaN(date.getTime()) ? null : date
      } catch {
        return null
      }
    },
  )
  const [pendingArticles, setPendingArticles] = useState<NormalizedArticle[]>([])
  const articlesRef = useRef(articles)
  useEffect(() => {
    articlesRef.current = articles
  }, [articles])
  const pendingArticlesRef = useRef(pendingArticles)
  useEffect(() => {
    pendingArticlesRef.current = pendingArticles
  }, [pendingArticles])
  const lastRefreshedAtRef = useRef(lastRefreshedAt)
  useEffect(() => {
    lastRefreshedAtRef.current = lastRefreshedAt
  }, [lastRefreshedAt])
  const shouldSkipInitialFetch = useRef(
    feedCache !== null && feedCache.lastRefreshedAt !== null,
  )
  const hasCompletedInitialLoad = useRef(
    feedCache !== null && feedCache.lastRefreshedAt !== null,
  )

  const applyFetchResult = useCallback(
    (
      result: { articles: NormalizedArticle[]; errors: string[] },
      cachedArticles: NormalizedArticle[],
      forceUpdate = false,
    ) => {
      const now = new Date()
      const merged = mergeAndDeduplicate(result.articles, ensureProcessed(cachedArticles))

      const hasCachedData = cachedArticles.length > 0
      const visibleErrors = hasCachedData ? [] : result.errors
      const fetchSucceeded = result.articles.length > 0 || result.errors.length === 0

      if (hasCachedData && result.errors.length > 0) {
        for (const error of result.errors) {
          console.error("[feed] suppressed fetch error (cached data available):", error)
        }
      }

      const updatedRefreshedAt = fetchSucceeded
        ? now
        : feedCache?.lastRefreshedAt ?? lastRefreshedAtRef.current

      if (updatedRefreshedAt) {
        try {
          localStorage.setItem(LS_LAST_REFRESHED_KEY, updatedRefreshedAt.toISOString())
        } catch {
          // localStorage unavailable — continue without persisting
        }
      }

      const defer =
        articlesRef.current.length > 0 && !forceUpdate && hasCompletedInitialLoad.current
      if (!hasCompletedInitialLoad.current) {
        hasCompletedInitialLoad.current = true
      }

      if (defer) {
        const displayedIds = new Set(articlesRef.current.map((a) => a.id))
        const newOnes = merged.filter((article) => !displayedIds.has(article.id))

        feedCache = {
          articles: articlesRef.current,
          errors: visibleErrors,
          lastRefreshedAt: updatedRefreshedAt,
        }
        setPendingArticles(newOnes)
        pendingArticlesRef.current = newOnes
      } else {
        const articlesChanged = forceUpdate || hasArticleListChanged(articlesRef.current, merged)

        feedCache = {
          articles: articlesChanged ? merged : articlesRef.current,
          errors: visibleErrors,
          lastRefreshedAt: updatedRefreshedAt,
        }
        if (articlesChanged) {
          setArticles(merged)
          articlesRef.current = merged
        }
        if (forceUpdate) {
          setPendingArticles([])
          pendingArticlesRef.current = []
        }
      }
      setErrors(visibleErrors)
      setLastRefreshedAt(updatedRefreshedAt)
      setLoading(false)
      if (result.articles.length > 0) {
        articleCache.upsertMany(result.articles).catch(() => {})
      }
    },
    [],
  )

  const acceptPending = useCallback(() => {
    const pending = pendingArticlesRef.current
    if (pending.length === 0) return
    const merged = mergeAndDeduplicate(pending, articlesRef.current)
    feedCache = {
      articles: merged,
      errors: feedCache?.errors ?? [],
      lastRefreshedAt: feedCache?.lastRefreshedAt ?? lastRefreshedAtRef.current,
    }
    setArticles(merged)
    articlesRef.current = merged
    setPendingArticles([])
    pendingArticlesRef.current = []
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setErrors([])
    const enabledSources = getFullyEnabledSources(isFeedEnabled)
    await articleCache.evict().catch(() => {})
    const [result, cached] = await Promise.all([
      fetchAllFeeds(isFeedEnabled),
      articleCache.getAll().catch(() => [] as NormalizedArticle[]),
    ])
    applyFetchResult(result, filterByEnabledSources(cached, enabledSources), true)
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
        const processed = ensureProcessed(cachedArticles)
        const sorted = sortChronologically(processed)
        const deduplicated = deduplicateArticles(sorted)
        feedCache = {
          articles: deduplicated,
          errors: [],
          lastRefreshedAt: null,
        }
        setArticles(deduplicated)
        articlesRef.current = deduplicated
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

  return {
    articles,
    loading,
    errors,
    lastRefreshedAt,
    refresh,
    pendingCount: pendingArticles.length,
    acceptPending,
  }
}
