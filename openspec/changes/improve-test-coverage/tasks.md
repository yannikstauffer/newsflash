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

## 5. E2E Suite Reduction

- [ ] 5.1 Rewrite `connectors.spec.ts` as live tests: remove all RSS mocking, use parameterized smoke test per connector (assert articles render + thumbnails load where `allHaveImages` is true), keep image mocking only
- [ ] 5.2 Create `tests-e2e/helpers/connector-setup.ts` helper to seed localStorage preferences without RSS mocking (split from current setup which does both)
- [ ] 5.3 Delete `feed.spec.ts` — covered by connector smoke tests
- [ ] 5.4 Consolidate `filter.spec.ts`: merge search tests into 1 flow test (narrow + empty + clear), merge day nav tests into 1 test (toggle + prev/next + today disabled), remove hidden toggle test (covered by article-actions)
- [ ] 5.5 Consolidate `article-actions.spec.ts`: keep hide+unhide flow, save+remove flow, empty read list (desktop); keep 2 swipe tests (mobile); remove keyboard shortcut tests and duplicate hidden toggle (unit tested)
- [ ] 5.6 Consolidate `navigation.spec.ts`: merge 4 tests into 1 full tab cycle test
- [ ] 5.7 Consolidate `settings.spec.ts`: merge language tests into 1, merge theme tests into 1, merge source tests into 1, keep persistence test
- [ ] 5.8 Configure Playwright mobile-chrome project to only run `article-actions.spec.ts`

## 6. CI and Scheduled Workflow

- [ ] 6.1 Uncomment Playwright steps in `.github/workflows/release.yml` to re-enable E2E in release CI
- [ ] 6.2 Uncomment `playwright-report.zip` upload in release assets
- [ ] 6.3 Create `.github/workflows/e2e-live.yml` with `schedule: cron "0 4 * * 4"` (Thu 04:00 UTC) and `workflow_dispatch`, running `npx playwright test --project=chromium tests-e2e/connectors.spec.ts`
- [ ] 6.4 Add status badge for `e2e-live.yml` workflow to `README.md`

## 7. Coverage Verification

- [ ] 7.1 Run `npm run test:coverage` and verify all three metrics (lines, branches, functions) are at or above 80%
- [ ] 7.2 If any metric is still below 80%, identify remaining gaps and add targeted tests

## 8. Quality Gates

- [ ] 8.1 Run `npm run lint` and fix any issues
- [ ] 8.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 8.3 Run `npm run test` and fix any issues
- [ ] 8.4 Run `npm run test:e2e` and fix any issues
- [ ] 8.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 8.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
