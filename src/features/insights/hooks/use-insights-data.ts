import { useMemo } from "react"

import { useArticleState } from "@/features/article-actions"
import { connectors } from "@/features/connectors/registry"
import { useFeedPreferences } from "@/features/feed-config/hooks/use-feed-preferences"
import { useFilterPreferences } from "@/features/feed-config/hooks/use-filter-preferences"
import { readStats } from "@/features/stats/stats-store"

const WINDOW_DAYS = 14
const MIN_APPEARED_THRESHOLD = 5
const HIDE_RATE_THRESHOLD = 0.5
const NO_ARTICLES_MIN_DAYS = 7

export interface FeedInsight {
  readonly feedId: string
  readonly feedName: string
  readonly sourceName: string
  readonly appeared: number
  readonly hidden: number
  readonly saved: number
  readonly hideRate: number
  readonly hasEnoughData: boolean
  readonly recommendDisable: boolean
  readonly noRecentArticles: boolean
}

export interface FilterInsight {
  readonly filterId: string
  readonly filterLabel: string
  readonly sourceName: string
  /** For enabled filters: articles shown from this category. For disabled filters: articles blocked. */
  readonly appeared: number
  readonly hidden: number
  readonly saved: number
  readonly hideRate: number
  readonly hasEnoughData: boolean
  readonly isEnabled: boolean
  readonly recommendEnable: boolean
  readonly recommendDisable: boolean
}

function getWindowDates(windowDays: number): Set<string> {
  const dates = new Set<string>()
  const today = new Date()
  for (let index = 0; index < windowDays; index++) {
    const d = new Date(today)
    d.setDate(d.getDate() - index)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    dates.add(key)
  }
  return dates
}

export function useInsightsData(): {
  sources: FeedInsight[]
  filters: FilterInsight[]
  hasData: boolean
} {
  const { isFeedEnabled } = useFeedPreferences()
  const { isFilterEnabled } = useFilterPreferences()
  const { readListArticles } = useArticleState()

  return useMemo(() => {
    const store = readStats()
    const windowDates = getWindowDates(WINDOW_DAYS)

    // Check if there's any data at all
    const hasData = Object.keys(store.days).length > 0

    // --- Feed insights (one card per enabled sub-feed) ---
    const sources: FeedInsight[] = []

    const windowDaysWithData = [...windowDates].filter((d) => store.days[d] !== undefined).length

    for (const connector of connectors) {
      for (const feed of connector.feeds) {
        if (!isFeedEnabled(feed.id)) continue

        // Aggregate counters over the 14-day window keyed by feed ID
        let appeared = 0
        let hidden = 0
        let saved = 0

        for (const [date, day] of Object.entries(store.days)) {
          if (!windowDates.has(date)) continue
          const s = day.sources[feed.id]
          if (s) {
            appeared += s.appeared
            hidden += s.hidden
            saved += s.saved
          }
        }

        const hideRate = appeared > 0 ? hidden / appeared : 0
        const hasEnoughData = appeared >= MIN_APPEARED_THRESHOLD
        const recommendDisable = hasEnoughData && hideRate > HIDE_RATE_THRESHOLD

        // Zero-engagement detection: ≥7 days within the window have data, but appeared === 0.
        const noRecentArticles = windowDaysWithData >= NO_ARTICLES_MIN_DAYS && appeared === 0

        sources.push({
          feedId: feed.id,
          feedName: feed.name,
          sourceName: connector.name,
          appeared,
          hidden,
          saved,
          hideRate,
          hasEnoughData,
          recommendDisable,
          noRecentArticles,
        })
      }
    }

    // --- Filters ---
    const filters: FilterInsight[] = []

    for (const connector of connectors) {
      for (const filter of connector.filters ?? []) {
        // Aggregate counters over the 14-day window
        let appeared = 0
        let hidden = 0
        let saved = 0

        for (const [date, day] of Object.entries(store.days)) {
          if (!windowDates.has(date)) continue
          const f = day.filters[filter.id]
          if (f) {
            appeared += f.appeared
            hidden += f.hidden
            saved += f.saved
          }
        }

        const filterEnabled = isFilterEnabled(filter.id, filter.enabledByDefault)

        const hideRate = appeared > 0 ? hidden / appeared : 0
        const hasEnoughData = appeared >= MIN_APPEARED_THRESHOLD

        // Filter disable recommendation:
        // filter is enabled AND the user has been manually hiding a high share of matching articles
        const recommendDisable = filterEnabled && hasEnoughData && hideRate > HIDE_RATE_THRESHOLD

        // Filter enable recommendation:
        // filter is disabled AND it is blocking many articles (appeared = blocked count)
        const recommendEnable = !filterEnabled && hasEnoughData

        filters.push({
          filterId: filter.id,
          filterLabel: filter.label,
          sourceName: connector.name,
          appeared,
          hidden,
          saved,
          hideRate,
          hasEnoughData,
          isEnabled: filterEnabled,
          recommendEnable,
          recommendDisable,
        })
      }
    }

    return { sources, filters, hasData }
  }, [isFeedEnabled, isFilterEnabled, readListArticles])
}
