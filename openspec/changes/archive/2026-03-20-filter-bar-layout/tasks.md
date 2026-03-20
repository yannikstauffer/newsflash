## 1. Update FilterBar Component

- [x] 1.1 Add day pagination props to FilterBar interface (selectedDate, allArticles, isToday, onPrev, onNext, onToggleAllArticles)
- [x] 1.2 Remove refreshButton prop from FilterBar interface
- [x] 1.3 Rearrange FilterBar layout: left section (All articles + Hidden toggles), centered section (prev/date/next), right section (search input)
- [x] 1.4 Implement centered day navigation that hides when allArticles is active

## 2. Update FeedPage Wiring

- [x] 2.1 Pass day pagination props from FeedPage to FilterBar
- [x] 2.2 Remove RefreshButton usage and import from FeedPage
- [x] 2.3 Remove DayPaginationHeader usage and import from FeedPage

## 3. Cleanup

- [x] 3.1 Delete day-pagination-header.tsx (functionality absorbed into FilterBar)
- [x] 3.2 Delete refresh-button.tsx if no other consumers exist

## 4. Testing & Verification

- [x] 4.1 Update or add FilterBar tests to verify new layout and prop changes
- [x] 4.2 Run linting and type checks
- [x] 4.3 Verify mobile responsiveness (controls wrap gracefully)
