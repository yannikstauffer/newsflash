import { useCallback, useRef } from "react"

import {
  batchIncrementStats,
  incrementFilterStat,
  incrementSourceStat,
} from "./stats-store"

import type { ArticleFilter, Connector, NormalizedArticle } from "@/features/connectors/types"

/** A filter that is currently enabled — the user sees matching articles in the feed */
export interface EnabledFilter {
  readonly filterId: string
  readonly match: ArticleFilter["match"]
}

interface UseStatsTrackerResult {
  /**
   * Call when the feed renders a new list of articles.
   * Deduplicates within the session so re-renders don't inflate counts.
   *
   * @param filteredArticles Articles visible in the feed (after filter removal)
   * @param rawArticles All articles before filter removal (used to count disabled-filter blocks)
   */
  readonly trackAppeared: (
    filteredArticles: NormalizedArticle[],
    rawArticles: NormalizedArticle[],
    connectors: readonly Connector[],
    isFilterEnabled: (filterId: string, enabledByDefault: boolean) => boolean,
  ) => void
  /** Call when the user hides an article. */
  readonly trackHidden: (
    article: NormalizedArticle,
    enabledFilters: readonly EnabledFilter[],
  ) => void
  /** Call when the user saves an article to the read list. */
  readonly trackSaved: (
    article: NormalizedArticle,
    enabledFilters: readonly EnabledFilter[],
  ) => void
}

export function useStatsTracker(): UseStatsTrackerResult {
  // Session-level deduplication: article IDs counted as "appeared" this session.
  // Resets when the component using this hook unmounts (new session).
  const seenArticleIds = useRef(new Set<string>())
  // Separate dedup for raw article disabled-filter tracking (may include articles
  // not in filteredArticles because they were removed by a disabled filter).
  const seenRawArticleIds = useRef(new Set<string>())

  const trackAppeared = useCallback(
    (
      filteredArticles: NormalizedArticle[],
      rawArticles: NormalizedArticle[],
      connectors: readonly Connector[],
      isFilterEnabled: (filterId: string, enabledByDefault: boolean) => boolean,
    ) => {
      // Collect all filters from all connectors, tagged with their owning connector id
      // so matching is scoped to the article's source connector only.
      const allFilters: Array<{ filterId: string; connectorId: string; enabledByDefault: boolean; match: ArticleFilter["match"] }> = []
      for (const connector of connectors) {
        for (const filter of connector.filters ?? []) {
          allFilters.push({
            filterId: filter.id,
            connectorId: connector.id,
            enabledByDefault: filter.enabledByDefault,
            match: filter.match,
          })
        }
      }

      // Accumulate counts in-memory, then flush in a single localStorage read+write
      const sourceCounts: Record<string, Partial<Record<"appeared", number>>> = {}
      const filterCounts: Record<string, Partial<Record<"appeared", number>>> = {}

      // Track feed appeared + enabled-filter appeared for articles the user sees
      for (const article of filteredArticles) {
        if (seenArticleIds.current.has(article.id)) continue
        seenArticleIds.current.add(article.id)

        const feedKey = article.feedId ?? article.source
        // eslint-disable-next-line security/detect-object-injection -- feedKey comes from our feed registry
        sourceCounts[feedKey] = { appeared: (sourceCounts[feedKey]?.appeared ?? 0) + 1 }

        // Track appeared for ENABLED filters: article was shown because filter includes this category.
        // Scoped to the owning connector to avoid cross-connector false-positives.
        for (const filter of allFilters) {
          const isEnabled = isFilterEnabled(filter.filterId, filter.enabledByDefault)
          // eslint-disable-next-line unicorn/prefer-regexp-test -- ArticleFilter.match()
          if (article.source === filter.connectorId && isEnabled && filter.match(article)) {
            filterCounts[filter.filterId] = { appeared: (filterCounts[filter.filterId]?.appeared ?? 0) + 1 }
          }
        }
      }

      // Track appeared for DISABLED filters on raw articles (articles blocked by the filter)
      // This counts how many articles each disabled filter suppresses per session.
      for (const article of rawArticles) {
        if (seenRawArticleIds.current.has(article.id)) continue
        seenRawArticleIds.current.add(article.id)

        for (const filter of allFilters) {
          const isEnabled = isFilterEnabled(filter.filterId, filter.enabledByDefault)
          // eslint-disable-next-line unicorn/prefer-regexp-test -- ArticleFilter.match()
          if (article.source === filter.connectorId && !isEnabled && filter.match(article)) {
            filterCounts[filter.filterId] = { appeared: (filterCounts[filter.filterId]?.appeared ?? 0) + 1 }
          }
        }
      }

      batchIncrementStats(sourceCounts, filterCounts)
    },
    [],
  )

  const trackHidden = useCallback(
    (article: NormalizedArticle, enabledFilters: readonly EnabledFilter[]) => {
      incrementSourceStat(article.feedId ?? article.source, "hidden")

      for (const filter of enabledFilters) {
        // eslint-disable-next-line unicorn/prefer-regexp-test -- ArticleFilter.match()
        if (filter.match(article)) {
          incrementFilterStat(filter.filterId, "hidden")
        }
      }
    },
    [],
  )

  const trackSaved = useCallback(
    (article: NormalizedArticle, enabledFilters: readonly EnabledFilter[]) => {
      incrementSourceStat(article.feedId ?? article.source, "saved")

      for (const filter of enabledFilters) {
        // eslint-disable-next-line unicorn/prefer-regexp-test -- ArticleFilter.match()
        if (filter.match(article)) {
          incrementFilterStat(filter.filterId, "saved")
        }
      }
    },
    [],
  )

  return { trackAppeared, trackHidden, trackSaved }
}
