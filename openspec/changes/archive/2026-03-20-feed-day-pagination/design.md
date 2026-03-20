## Context

The feed fetches all articles upfront via `useFeedData` and renders them as a flat list in `FeedList`. Filtering happens in `filterArticles`. Pagination will be a client-side UI grouping — no changes to data fetching.

## Goals / Non-Goals

**Goals:**
- Paginate the feed by day with prev/next navigation
- Show a formatted day label in lowercase
- Provide an "All articles" escape hatch to see everything

**Non-Goals:**
- Server-side pagination or partial fetching
- Grouping by anything other than calendar day
- Changing the data fetching strategy

## Decisions

### 1. Pagination state as a `Date` representing the selected day

Store `selectedDate: Date` (midnight-normalized) in `FeedPage` state, defaulting to today. Prev/next shift by one calendar day. An `allArticles: boolean` flag toggles the view mode.

**Why Date over offset?** Direct date comparison is simpler for filtering and label formatting. Offset-based (`daysAgo: number`) adds unnecessary arithmetic.

### 2. Day filtering as a utility function

Create `filterByDay(articles: NormalizedArticle[], date: Date): NormalizedArticle[]` that compares `publishedAt` year/month/day against the target date. This runs after the existing `filterArticles` so all other filters are applied first, then day slicing happens on top.

### 3. Day label formatting as a standalone utility

Create `formatDayLabel(date: Date): string` that returns:
- `"today, dd.MM.yyyy"` if same as today
- `"yesterday, dd.MM.yyyy"` if one day before today
- `"<weekday>, dd.MM.yyyy"` for all other dates (weekday always lowercase)

Uses manual formatting consistent with the absolute time functions from the card-metadata-redesign change.

### 4. Day pagination header as a separate component

Create `DayPaginationHeader` component that renders the day label, prev/next buttons, and "All articles" toggle. It receives the selected date, navigation callbacks, and view mode as props.

## Risks / Trade-offs

- **Performance with large article sets** — filtering by day runs on every render. Mitigated by `useMemo` and the fact that the full article list is already in memory.
- **Timezone edge cases** — articles published near midnight could appear on the "wrong" day depending on local timezone. Using local timezone consistently (via `Date` methods) is acceptable for a personal news reader.
