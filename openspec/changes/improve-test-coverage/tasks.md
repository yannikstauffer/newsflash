## 1. useFeedPage Hook Unit Tests

- [ ] 1.1 Create `src/features/feed/hooks/use-feed-page.test.ts` with mocks for `useFeedData`, `useArticleState`, `useFeedPreferences`, and `useArticleKeyboardShortcuts`
- [ ] 1.2 Test filtering logic: articles filtered by day (default), all articles when toggled, search query filtering
- [ ] 1.3 Test day navigation: `onPrev` decrements date, `onNext` increments date, `isToday` computation
- [ ] 1.4 Test `onToggleAllArticles` resets `selectedDate` to today when toggled off
- [ ] 1.5 Test `articleCount` and `hiddenCount` in both `showHidden` true/false states
- [ ] 1.6 Test keyboard hide callback: triggers `triggerRemoval("right")` with card ref, falls back to `hideArticle` without ref
- [ ] 1.7 Test keyboard save callback: no-op when article not found, no-op when already in read list, triggers card removal or direct add
- [ ] 1.8 Test `renderActions`: returns `HiddenArticleActions` for hidden articles when `showHidden` is true, `ArticleActionButtons` otherwise
- [ ] 1.9 Test `onHideAll` calls `hideArticles` with `visibleArticleIds`
- [ ] 1.10 Test `emptyMessage`: present when not `allArticles` and not `loading`, undefined otherwise

## 2. useArticleState Branch Coverage

- [ ] 2.1 Add tests for `unhideArticles`: removes multiple IDs, no-op for IDs not in list
- [ ] 2.2 Add tests for `clearReadList`: empties the read list completely
- [ ] 2.3 Add tests for `restoreReadList`: adds without duplicates, caps at `MAX_READLIST_ITEMS`
- [ ] 2.4 Add tests for `readListIds` and `readListArticles` derived memos

## 3. extract-leading-image Branch Coverage

- [ ] 3.1 Add tests for uncovered branches: no images → undefined, empty src skipped, relative URL resolution, data URI skipped

## 4. feed-config-page Function Coverage

- [ ] 4.1 Add tests for uncovered functions: all feed groups rendered, language selector triggers change, theme toggle updates preference

## 5. E2E Test Maintenance

- [ ] 5.1 Review `connectors.spec.ts` for redundancy with `article-card.test.tsx` and `connectors.test.ts` — remove or simplify redundant tests
- [ ] 5.2 Review `filter.spec.ts` for redundancy with `filter-articles.test.ts` — keep only tests that verify full UI interaction flow
- [ ] 5.3 Uncomment Playwright steps in `.github/workflows/release.yml` to re-enable E2E in release CI
- [ ] 5.4 Uncomment `playwright-report.zip` upload in release assets

## 6. Coverage Verification

- [ ] 6.1 Run `npm run test:coverage` and verify all three metrics (lines, branches, functions) are at or above 80%
- [ ] 6.2 If any metric is still below 80%, identify remaining gaps and add targeted tests

## 7. Quality Gates

- [ ] 7.1 Run `npm run lint` and fix any issues
- [ ] 7.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 7.3 Run `npm run test` and fix any issues
- [ ] 7.4 Run `npm run test:e2e` and fix any issues
- [ ] 7.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 7.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
