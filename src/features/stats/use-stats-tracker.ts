import { useCallback, useRef } from "react"

import {
  batchIncrementStats,
  incrementFilterStat,
  incrementSourceStat,
} from "./stats-store"

import type { ArticleFilter, Connector, NormalizedArticle } from "@/features/connectors/types"

/** A filter that is currently disabled — the user sees matching articles */
export interface DisabledFilter {
  readonly filterId: string
  readonly match: ArticleFilter["match"]
}

interface UseStatsTrackerResult {
  /**
   * Call when the feed renders a new list of articles.
   * Deduplicates within the session so re-renders don't inflate counts.
   */
  readonly trackAppeared: (
    articles: NormalizedArticle[],
    connectors: readonly Connector[],
    isFilterEnabled: (filterId: string, enabledByDefault: boolean) => boolean,
  ) => void
  /** Call when the user hides an article. */
  readonly trackHidden: (
    article: NormalizedArticle,
    disabledFilters: readonly DisabledFilter[],
  ) => void
  /** Call when the user saves an article to the read list. */
  readonly trackSaved: (
    article: NormalizedArticle,
    disabledFilters: readonly DisabledFilter[],
  ) => void
}

export function useStatsTracker(): UseStatsTrackerResult {
  // Session-level deduplication: article IDs counted as "appeared" this session.
  // Resets when the component using this hook unmounts (new session).
  const seenArticleIds = useRef(new Set<string>())

  const trackAppeared = useCallback(
    (
      articles: NormalizedArticle[],
      connectors: readonly Connector[],
      isFilterEnabled: (filterId: string, enabledByDefault: boolean) => boolean,
    ) => {
      // Collect all filters from all connectors
      const allFilters: Array<{ filterId: string; enabledByDefault: boolean; match: ArticleFilter["match"] }> = []
      for (const connector of connectors) {
        for (const filter of connector.filters ?? []) {
          allFilters.push({
            filterId: filter.id,
            enabledByDefault: filter.enabledByDefault,
            match: filter.match,
          })
        }
      }

      // Accumulate counts in-memory, then flush in a single localStorage read+write
      const sourceCounts: Record<string, Partial<Record<"appeared", number>>> = {}
      const filterCounts: Record<string, Partial<Record<"appeared", number>>> = {}

      for (const article of articles) {
        if (seenArticleIds.current.has(article.id)) continue
        seenArticleIds.current.add(article.id)

        sourceCounts[article.source] = { appeared: (sourceCounts[article.source]?.appeared ?? 0) + 1 }

        // Track filter appeared only for disabled filters (user sees matching articles)
        for (const filter of allFilters) {
          // eslint-disable-next-line unicorn/prefer-regexp-test -- ArticleFilter.match()
          if (!isFilterEnabled(filter.filterId, filter.enabledByDefault) && filter.match(article)) {
            filterCounts[filter.filterId] = { appeared: (filterCounts[filter.filterId]?.appeared ?? 0) + 1 }
          }
        }
      }

      batchIncrementStats(sourceCounts, filterCounts)
    },
    [],
  )

  const trackHidden = useCallback(
    (article: NormalizedArticle, disabledFilters: readonly DisabledFilter[]) => {
      incrementSourceStat(article.source, "hidden")

      for (const filter of disabledFilters) {
        // eslint-disable-next-line unicorn/prefer-regexp-test -- ArticleFilter.match()
        if (filter.match(article)) {
          incrementFilterStat(filter.filterId, "hidden")
        }
      }
    },
    [],
  )

  const trackSaved = useCallback(
    (article: NormalizedArticle, disabledFilters: readonly DisabledFilter[]) => {
      incrementSourceStat(article.source, "saved")

      for (const filter of disabledFilters) {
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
