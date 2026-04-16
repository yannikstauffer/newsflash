## Context

The app has a 3-item bottom nav (Feed, Read List, Settings). User engagement data exists implicitly — hidden article IDs carry a source prefix, read-list articles carry a source field — but it's never surfaced. A new Insights page requires both a storage layer for tracked engagement data and a navigation change to accommodate a fourth destination without crowding the primary nav.

Current sync model: all synced keys use last-write-wins, resolved by a companion `<key>:updated_at` timestamp. Stats data cannot use this model because two devices produce independent, additive counts for the same time bucket.

## Goals / Non-Goals

**Goals:**
- Collect per-source and per-filter engagement counts (appeared, hidden, saved) in daily buckets
- Surface these as an Insights page with noise-reduction recommendations
- Sync stats across devices without losing counts from either device
- Extend the nav in a way that scales to future secondary pages

**Non-Goals:**
- Viewport-level tracking (IntersectionObserver, scroll depth) — "appeared" means rendered in the feed, not visually seen
- Server-side recommendation logic — all computation is client-side
- Historical data before this feature ships — day-zero baseline is zero
- Syncing stats in real time — stats sync on the same trigger as other keys

## Decisions

### Stats storage format: daily buckets in localStorage

Stats are stored under `newsflash:stats` in localStorage as:

```ts
interface StatsStore {
  version: 1
  days: Record<string, DayStats>   // key: "YYYY-MM-DD"
}

interface DayStats {
  sources: Record<string, { appeared: number; hidden: number; saved: number }>
  filters: Record<string, { appeared: number; hidden: number; saved: number }>
}
```

**Why localStorage over IndexedDB:** All other synced data lives in localStorage; using the same store keeps the sync pipeline uniform. At ~62KB for 90 days of data across 7 sources and 10 filters, storage pressure is negligible.

**Why daily buckets over a single counter:** A flat counter can never answer trend questions. Daily buckets support 7/14/30-day windows, week-over-week comparison, and future features (reading time of day, weekday patterns) by simply adding new fields to `DayStats`.

**Why `version: 1`:** Enables schema migration if the shape needs to change — old snapshots can be detected and migrated or discarded cleanly.

**90-day TTL:** On every write, days older than 90 days are evicted. Balances richness of history against storage growth.

---

### Additive merge for stats sync

The existing sync strategy (last-write-wins by timestamp) would silently discard one device's counts whenever two devices sync. Stats require an additive merge.

**Approach: delta tracking**

After each sync, the app snapshots the just-synced remote state for the stats key. On the next sync, the delta is computed as `current_local - last_synced_snapshot` per counter. This delta is added to the remote value:

```
merged = remote + (current_local - last_synced_snapshot)
```

The snapshot is stored locally under `newsflash:stats:synced-snapshot` and is updated after every successful sync. It is never synced itself.

**Why not MAX:** Taking the maximum per counter would undercount multi-device users (Device A: appeared=5, Device B: appeared=3 on the same day → max=5, losing 3 real appearances).

**Why not raw SUM on every sync:** Summing without tracking deltas double-counts counts that are already in the remote (they get added again on the next sync from the same device).

**Trade-off:** If a device's local storage is cleared, the snapshot is lost and the delta becomes the full local value — this may re-add counts already in remote. Acceptable for non-critical analytics data.

---

### "Appeared" is tracked at feed render, not scroll position

When the feed hook resolves a list of articles for display, each article's source is incremented in today's `appeared` counter. Filter matching is run at the same point.

**Why:** Simple, zero-dependency, already happens on every feed load. The alternative (IntersectionObserver per card) is significantly more complex and the marginal accuracy improvement doesn't change recommendation quality.

**Deduplication:** A single feed load may render the same articles multiple times (refresh, date navigation back and forth). The stats hook tracks which article IDs have been counted in the current session to avoid inflating counts.

---

### Recommendations are computed client-side from stored stats

No server involvement. The Insights page reads `StatsStore` from localStorage and the connector registry at render time, computes the recommendation signals, and renders them.

**Source recommendation threshold:** hide rate > 50% over last 14 days AND at least 5 articles seen. Surfaces sources that are generating mostly-dismissed content.

**Filter recommendation — "consider enabling":** filter is currently disabled (user sees these articles), matched articles in last 14 days > 0, and hidden rate among matched articles > 50%.

**Filter recommendation — "consider disabling":** filter is currently enabled (hiding articles), AND at least one read-list article would have matched this filter (saved before/without the filter). Surfaces over-aggressive filtering.

**Zero-engagement detection:** a source or filter that has been active for ≥ 7 days but has `appeared === 0` is flagged separately as "no recent articles" (possibly a broken or empty feed).

---

### Navigation: MoreVertical overflow button + bottom sheet

The Settings nav item is replaced by a `MoreVertical` button. Tapping it opens an upward bottom sheet (on mobile) or a popover (on desktop) listing: Insights, Settings. The sheet closes on item selection or backdrop tap.

The sync status indicator (currently on the Settings nav icon) moves to the `MoreVertical` button as a small status dot overlay.

**Why a sheet over a popover on mobile:** Consistent with mobile conventions; easier to reach on large phones; matches the swipe-dismiss mental model already present in the app (swipeable article cards).

**Component:** implemented using `@base-ui/react` (already a dependency), which provides accessible dialog/popup primitives.

**Scalability:** future secondary pages (About, Export/Import, What's New) are added to the sheet without touching the primary nav.

---

### Insights page route: `/insights`, lazy-loaded

Follows the same pattern as `/read-list` and `/settings` — lazy route component to keep the initial bundle small.

## Risks / Trade-offs

- **Stats accuracy on first 14 days:** Recommendations require a minimum threshold of 5–10 articles to be meaningful. New users will see an empty/low-confidence state for the first week or two. → Mitigated by showing "not enough data yet" messaging below threshold.
- **Snapshot loss on storage clear:** If localStorage is cleared, the delta-sync snapshot is lost and counts may inflate on the next sync. → Acceptable for analytics data; cap individual counter increments at a reasonable daily maximum as a safety guard.
- **Filter match performance:** Running every connector filter's `match()` function across all rendered articles on every feed load is O(articles × filters). With ~100 articles/day and ~10 filters, this is negligible. → Monitor if connector count grows significantly.
- **appeared inflation from rapid date navigation:** Users navigating back and forth across days could trigger multiple appeared-counts for the same articles. → Mitigated by session-level deduplication set (article IDs seen this session).

## Open Questions

- Should the bottom sheet on desktop be a popover anchored to the button, or a centred modal? (Currently assuming popover for desktop.)
- Should the Insights page show a chart/sparkline for trends, or start with plain numbers and text recommendations only? (Assuming plain numbers for v1.)
