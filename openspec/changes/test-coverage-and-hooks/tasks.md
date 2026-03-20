## 1. Coverage Configuration

- [x] 1.1 Install `@vitest/coverage-v8` as a dev dependency
- [x] 1.2 Add `coverage` configuration to `vitest.config.ts` with provider `v8`, 80% thresholds for lines/branches/functions, and appropriate excludes
- [x] 1.3 Add `test:coverage` script to `package.json` that runs `vitest run --coverage`
- [x] 1.4 Verify `npm run test:coverage` runs successfully and reports coverage

## 2. useFeedData Tests

- [x] 2.1 Create `src/features/feed/hooks/use-feed-data.test.ts` with mocks for `fetchFeed` and `connectors`
- [x] 2.2 Test deduplication: duplicate articles removed, same-title-different-timestamp kept
- [x] 2.3 Test chronological sorting (newest first)
- [x] 2.4 Test error aggregation: partial failure, total failure
- [x] 2.5 Test loading state transitions during refresh
- [x] 2.6 Test that disabled feeds are not fetched

## 3. useFeedPreferences Tests

- [x] 3.1 Create `src/features/feed-config/hooks/use-feed-preferences.test.ts` with mock for `useLocalStorage`
- [x] 3.2 Test toggleFeed: enabled-to-disabled and disabled-to-enabled
- [x] 3.3 Test setLanguage and default language value
- [x] 3.4 Test setAllForSource bulk enable/disable
- [x] 3.5 Test isFeedEnabled defaults to true for unknown feeds

## 4. useLazyList Edge-Case Tests

- [x] 4.1 Add test for empty items array in `src/hooks/use-lazy-list.test.ts`
- [x] 4.2 Add test for batch size of 1
- [x] 4.3 Add test for sentinel ref receiving null
