## 1. Simplify FilterBar Component

- [x] 1.1 Remove source pill buttons and connector import from `filter-bar.tsx`
- [x] 1.2 Remove language selector (radio group) from `filter-bar.tsx`
- [x] 1.3 Remove `enabledSources`, `onToggleSource`, `language`, `onLanguageChange` props from `FilterBarProps`
- [x] 1.4 Collapse the two-row layout into a single `flex` row with hidden toggle, search, and refresh

## 2. Simplify FeedPage State

- [x] 2.1 Remove `enabledSources` local state and `handleToggleSource` callback from `feed-page.tsx`
- [x] 2.2 Remove `language` local state from `feed-page.tsx`
- [x] 2.3 Read source enablement from `useFeedPreferences().isFeedEnabled` for filtering
- [x] 2.4 Read language preference from shared hook (or default to `"all"` if settings-page-overhaul not yet implemented)
- [x] 2.5 Update `filterArticles` call to use preferences-based source and language values
- [x] 2.6 Remove now-unused props passed to `FilterBar`

## 3. Verification

- [x] 3.1 Run `npm run lint` and fix any issues
- [x] 3.2 Run `npm run test` and verify all tests pass
- [x] 3.3 Run JetBrains diagnostics on changed files
