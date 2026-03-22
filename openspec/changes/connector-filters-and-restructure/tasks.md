## 1. Folder Restructure

- [ ] 1.1 Create `src/features/connectors/sources/` directory
- [ ] 1.2 Move all `*-connector.ts` files from `src/features/connectors/` to `src/features/connectors/sources/`
- [ ] 1.3 Move `connectors.test.ts` to `src/features/connectors/sources/`
- [ ] 1.4 Update `registry.ts` imports to use `./sources/*` paths
- [ ] 1.5 Update any other imports referencing the old connector paths (e.g., test files, feed config)
- [ ] 1.6 Verify the app builds and existing tests pass after the move

## 2. Type Definitions

- [ ] 2.1 Add `ArticleFilter` interface to `src/features/connectors/types.ts` with `id`, `label`, `enabledByDefault`, and `match` fields
- [ ] 2.2 Add optional `filters?: readonly ArticleFilter[]` property to the `Connector` interface

## 3. Connector Filter Definitions

- [ ] 3.1 Add `heise-plus` and `heise-angebot` filters to the heise connector
- [ ] 3.2 Add 7 category-based filters to the digitec connector
- [ ] 3.3 Add 7 category-based filters to the galaxus connector
- [ ] 3.4 Add `winfuture-downloads` filter to the winfuture connector
- [ ] 3.5 Write unit tests for all filter `match` functions (heise title prefixes, digitec/galaxus categories, winfuture URL patterns, non-matching articles)

## 4. Filter Preferences Hook

- [ ] 4.1 Create `useFilterPreferences` hook in `src/features/feed-config/hooks/` with localStorage key `"newsflash:filter-prefs"`
- [ ] 4.2 Implement `isFilterEnabled(filterId, enabledByDefault)` — returns `store[filterId] !== false` when `enabledByDefault: true`, returns `store[filterId] === true` when `enabledByDefault: false`
- [ ] 4.3 Implement `toggleFilter(filterId, enabledByDefault)` toggle function
- [ ] 4.4 Write unit tests for the hook (default states, toggle behavior, persistence)

## 5. Pipeline Integration

- [ ] 5.1 Extend `FilterOptions` in `filter-articles.ts` with connector filter data (connectors list and `isFilterEnabled` callback)
- [ ] 5.2 Add connector filter check to `filterArticles()`: for each article, look up connector by `article.source`, iterate filters, exclude if filter is disabled and `match` returns true
- [ ] 5.3 Update all call sites of `filterArticles()` to pass the new filter options
- [ ] 5.4 Write unit tests for `filterArticles()` with connector filters (disabled filter excludes, enabled filter shows, no-filter connector passes through)

## 6. Settings UI

- [ ] 6.1 Add filter section to `feed-config-page.tsx` — render filter checkboxes below feed list for connectors with filters
- [ ] 6.2 Wire filter checkboxes to `useFilterPreferences` hook
- [ ] 6.3 Write unit tests for the filter section rendering (shown only for connectors with filters, checkbox states, toggle behavior)

## 7. E2E Tests

- [ ] 7.1 Add e2e test verifying filter toggles appear in settings for connectors with filters
- [ ] 7.2 Add e2e test verifying toggling a filter excludes/includes matching articles

## 8. Quality Gates

- [ ] 8.1 Run `npm run lint` and fix any issues
- [ ] 8.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 8.3 Run `npm run test` and fix any issues
- [ ] 8.4 Run `npm run test:e2e` and fix any issues
- [ ] 8.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 8.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
