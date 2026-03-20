## 1. Day Utilities

- [x] 1.1 Create `filterByDay(articles, date)` utility that filters articles by matching `publishedAt` year/month/day
- [x] 1.2 Create `formatDayLabel(date)` utility returning lowercase day labels (`today, dd.MM.yyyy` / `yesterday, dd.MM.yyyy` / `<weekday>, dd.MM.yyyy`)
- [x] 1.3 Write tests for `filterByDay` covering same-day match, cross-midnight, empty results
- [x] 1.4 Write tests for `formatDayLabel` covering today, yesterday, older days, weekday names

## 2. Day Pagination Header Component

- [x] 2.1 Create `DayPaginationHeader` component with prev/next buttons, day label, and "All articles" toggle
- [x] 2.2 Disable "next" button when selected date is today
- [x] 2.3 Hide prev/next buttons when in "All articles" mode

## 3. Feed Page Integration

- [x] 3.1 Add `selectedDate` state (defaults to today) and `allArticles` boolean to `FeedPage`
- [x] 3.2 Apply `filterByDay` after existing `filterArticles` when not in "All articles" mode
- [x] 3.3 Wire `DayPaginationHeader` into `FeedPage` above the `FeedList`
- [x] 3.4 Reset `selectedDate` to today when switching back from "All articles" mode
- [x] 3.5 Show "no articles for this day" message when day filter returns empty results

## 4. Verification

- [x] 4.1 Run `npm run lint` and fix any issues
- [x] 4.2 Run `npm run test` and verify all tests pass
- [x] 4.3 Run JetBrains diagnostics on changed files
