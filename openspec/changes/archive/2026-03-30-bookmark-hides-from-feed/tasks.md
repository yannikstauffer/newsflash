## 1. Swipe-left bookmark: add hideArticle call

- [x] 1.1 In `use-feed-page.ts` `renderArticleWrapper`, update the `swipeLeft.onAction` callback to call `hideArticle(article.id)` alongside `addToReadList(article)` (and `removeFromReadList` branch should NOT unhide)

## 2. Button bookmark: add hideArticle call + fade animation

- [x] 2.1 Add a `useRef<Map<string, SwipeableCardHandle>>` in `useFeedPage` to track SwipeableCard refs by article ID
- [x] 2.2 In `renderArticleWrapper`, attach a ref callback to `SwipeableCard` that registers/unregisters the handle in the ref map
- [x] 2.3 In `renderActions`, update the `onSave` callback to call `hideArticle(article.id)` alongside `addToReadList(article)`, then call `swipeableCardRef.get(article.id)?.triggerRemoval()` (no direction = fade-only)

## 3. Keyboard bookmark: add hideArticle call + fade animation

- [x] 3.1 In `use-feed-page.ts` `handleKeyboardSave`, call `hideArticle(articleId)` alongside `addToReadList(article)`, then call `swipeableCardRef.get(articleId)?.triggerRemoval()` for fade-only animation

## 4. Update E2E tests

- [x] 4.1 In `tests-e2e/article-actions.spec.ts`, update the "save article" test to assert the card disappears from the main feed after bookmarking (instead of asserting it remains visible)
- [x] 4.2 Add E2E test: bookmark an article, reload the page, verify the article does not reappear in the main feed

## 5. Unit tests

- [x] 5.1 Add/update unit tests for `useFeedPage` to verify that bookmark actions call both `addToReadList` and `hideArticle`

## 6. Quality Gates

- [x] 6.1 Run `npm run lint` and fix any issues
- [x] 6.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 6.3 Run `npm run test` and fix any issues
- [x] 6.4 Run `npm run test:e2e` and fix any issues
- [x] 6.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 6.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
