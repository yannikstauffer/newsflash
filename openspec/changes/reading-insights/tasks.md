## 1. Stats Storage Module

- [x] 1.1 Create `src/features/stats/stats-store.ts` — define `StatsStore`, `DayStats`, `SourceDayStats`, `FilterDayStats` TypeScript interfaces
- [x] 1.2 Implement `readStats()` and `writeStats()` helpers that read/write `newsflash:stats` from localStorage with 90-day eviction on write
- [x] 1.3 Implement `incrementSourceStat(sourceId, counter, date?)` — increments a single counter in today's (or given) day bucket
- [x] 1.4 Implement `incrementFilterStat(filterId, counter, date?)` — same for filter buckets
- [x] 1.5 Write unit tests for `readStats`, `writeStats`, `incrementSourceStat`, `incrementFilterStat`, and 90-day eviction logic
- [x] 1.6 Write unit tests for session-level deduplication (same article ID does not increment appeared twice)

## 2. Stats Sync Integration

- [x] 2.1 Add `newsflash:stats` to `SYNCED_KEYS` in `sync-service.ts` with a flag marking it as additive-merge
- [x] 2.2 Implement `computeStatsDelta(current, snapshot)` — returns per-day, per-source/filter delta object
- [x] 2.3 Implement `mergeStats(remote, delta)` — returns merged stats by adding delta counters to remote counters
- [x] 2.4 Update `performSync()` to use additive merge for the stats key: load snapshot, compute delta, merge with remote, write merged result back, save new snapshot
- [x] 2.5 Implement snapshot read/write helpers for `newsflash:stats:synced-snapshot` (never synced)
- [x] 2.6 Write unit tests for `computeStatsDelta`, `mergeStats`, and the full sync round-trip (two devices, re-sync idempotency)

## 3. Event Tracking Hooks

- [x] 3.1 Create `src/features/stats/use-stats-tracker.ts` — hook exposing `trackAppeared(articles, activeFilters)`, `trackHidden(article, activeFilters)`, `trackSaved(article, activeFilters)`
- [x] 3.2 Implement session-level deduplication set inside `useStatsTracker` (resets on mount)
- [x] 3.3 Call `trackAppeared` in the feed render path (in `use-feed-data.ts` or `feed-list.tsx`) when the article list resolves
- [x] 3.4 Call `trackHidden` in `useArticleState.hideArticle` (pass active filters from context or call site)
- [x] 3.5 Call `trackSaved` in `useArticleState.addToReadList`
- [x] 3.6 Wire active filter list through to the tracking calls (use connector registry + filter preferences)
- [x] 3.7 Write unit tests for `useStatsTracker` — appeared deduplication, hidden/saved increment, filter matching

## 4. Navigation Refactor

- [x] 4.1 Create `src/app/components/overflow-sheet.tsx` — bottom sheet (mobile) / popover (desktop) listing Insights and Settings items, using `@base-ui/react`
- [x] 4.2 Update `bottom-nav.tsx` — remove Settings `<Link>`, add `OverflowButton` (MoreVertical icon, 48px touch target) that toggles the overflow sheet
- [x] 4.3 Move sync status indicator logic from `SyncNavIcon` to the overflow button — show animated/success/error state as an overlay indicator on the MoreVertical icon
- [x] 4.4 Register `/insights` route in `router.tsx` as a lazy-loaded route component
- [x] 4.5 Add `aria-current="page"` active state to the overflow sheet items when the current route matches
- [x] 4.6 Update i18n locale files with keys for `nav.overflow`, `nav.insights`, and `nav.overflowOpen` aria-label
- [x] 4.7 Write unit tests for `OverflowSheet` — opens on button press, closes on backdrop tap, keyboard navigation, active state
- [x] 4.8 Write unit tests for updated `BottomNav` — Settings link absent, overflow button present, sync status indicator variants

## 5. Insights Page — Data Layer

- [x] 5.1 Create `src/features/insights/hooks/use-insights-data.ts` — reads stats store, computes 14-day windows per source and filter, returns `SourceInsight[]` and `FilterInsight[]`
- [x] 5.2 Implement source recommendation logic: hide rate > 50% AND appeared ≥ 5 → `recommendDisable: true`
- [x] 5.3 Implement zero-engagement source detection: appeared === 0 across ≥ 7 stored days → `noRecentArticles: true`
- [x] 5.4 Implement filter enable recommendation: filter disabled AND matched-hidden / matched-appeared > 50% AND matched-appeared ≥ 5
- [x] 5.5 Implement filter disable recommendation: filter enabled AND read-list articles count matching `filter.match()` > 0
- [x] 5.6 Write unit tests for all recommendation conditions including boundary cases (exactly 50%, exactly 5 articles, threshold not met)
- [x] 5.7 Write unit tests for empty-data state (no day buckets → empty insights)

## 6. Insights Page — UI

- [x] 6.1 Create `src/features/insights/components/insights-page.tsx` — page shell with heading, empty state, and sections for sources and filters
- [x] 6.2 Implement `SourceInsightCard` component — shows source name, appeared/hidden/saved counts, hide rate, and recommendation badge if applicable
- [x] 6.3 Implement `FilterInsightCard` component — shows filter label, source name, matched counts, and recommendation badge if applicable
- [x] 6.4 Implement empty state component for when no stats have been collected yet
- [x] 6.5 Implement "not enough data" indicator for sources/filters below threshold
- [x] 6.6 Write unit tests for `InsightsPage` — empty state renders, source cards render with correct counts, recommendation badges appear under the right conditions

## 7. Quality Gates

- [x] 7.1 Run `npm run lint` and fix any issues
- [x] 7.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 7.3 Run `npm run test` and fix any issues
- [x] 7.4 Run `npm run test:e2e` and fix any issues
- [x] 7.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 7.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
