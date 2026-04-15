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

export interface SourceInsight {
  readonly sourceId: string
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
  readonly appeared: number
  readonly hidden: number
  readonly saved: number
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
  sources: SourceInsight[]
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

    // --- Sources ---
    const sources: SourceInsight[] = []

    for (const connector of connectors) {
      // Only show enabled sources
      const isEnabled = connector.feeds.some((f) => isFeedEnabled(f.id))
      if (!isEnabled) continue

      // Aggregate counters over the 14-day window
      let appeared = 0
      let hidden = 0
      let saved = 0

      for (const [date, day] of Object.entries(store.days)) {
        if (!windowDates.has(date)) continue
        const s = day.sources[connector.id]
        if (s) {
          appeared += s.appeared
          hidden += s.hidden
          saved += s.saved
        }
      }

      const hideRate = appeared > 0 ? hidden / appeared : 0
      const hasEnoughData = appeared >= MIN_APPEARED_THRESHOLD
      const recommendDisable = hasEnoughData && hideRate > HIDE_RATE_THRESHOLD

      // Zero-engagement detection: ≥7 stored days exist and appeared === 0 in all of them
      const storedDays = Object.keys(store.days)
      const noRecentArticles =
        storedDays.length >= NO_ARTICLES_MIN_DAYS && appeared === 0

      sources.push({
        sourceId: connector.id,
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

        // Filter enable recommendation:
        // filter is disabled AND matched-appeared ≥ 5 AND matched-hidden/matched-appeared > 50%
        const hideRate = appeared > 0 ? hidden / appeared : 0
        const recommendEnable =
          !filterEnabled &&
          appeared >= MIN_APPEARED_THRESHOLD &&
          hideRate > HIDE_RATE_THRESHOLD

        // Filter disable recommendation:
        // filter is enabled AND at least one read-list article matches this filter
        const readListMatchCount = filterEnabled
          ? readListArticles.filter((a) => filter.match(a)).length
          : 0
        const recommendDisable = filterEnabled && readListMatchCount > 0

        filters.push({
          filterId: filter.id,
          filterLabel: filter.label,
          sourceName: connector.name,
          appeared,
          hidden,
          saved,
          isEnabled: filterEnabled,
          recommendEnable,
          recommendDisable,
        })
      }
    }

    return { sources, filters, hasData }
  }, [isFeedEnabled, isFilterEnabled, readListArticles])
}
