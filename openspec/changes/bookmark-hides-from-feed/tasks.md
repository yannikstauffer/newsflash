## 1. Swipe-left bookmark: add hideArticle call

- [ ] 1.1 In `use-feed-page.ts` `renderArticleWrapper`, update the `swipeLeft.onAction` callback to call `hideArticle(article.id)` alongside `addToReadList(article)` (and `removeFromReadList` branch should NOT unhide)

## 2. Button bookmark: add hideArticle call + fade animation

- [ ] 2.1 Add a `useRef<Map<string, SwipeableCardHandle>>` in `useFeedPage` to track SwipeableCard refs by article ID
- [ ] 2.2 In `renderArticleWrapper`, attach a ref callback to `SwipeableCard` that registers/unregisters the handle in the ref map
- [ ] 2.3 In `renderActions`, update the `onSave` callback to call `hideArticle(article.id)` alongside `addToReadList(article)`, then call `swipeableCardRef.get(article.id)?.triggerRemoval()` (no direction = fade-only)

## 3. Keyboard bookmark: add hideArticle call + fade animation

- [ ] 3.1 In `use-feed-page.ts` `handleKeyboardSave`, call `hideArticle(articleId)` alongside `addToReadList(article)`, then call `swipeableCardRef.get(articleId)?.triggerRemoval()` for fade-only animation

## 4. Update E2E tests

- [ ] 4.1 In `tests-e2e/article-actions.spec.ts`, update the "save article" test to assert the card disappears from the main feed after bookmarking (instead of asserting it remains visible)
- [ ] 4.2 Add E2E test: bookmark an article, reload the page, verify the article does not reappear in the main feed

## 5. Unit tests

- [ ] 5.1 Add/update unit tests for `useFeedPage` to verify that bookmark actions call both `addToReadList` and `hideArticle`

## 6. Quality Gates

- [ ] 6.1 Run `npm run lint` and fix any issues
- [ ] 6.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 6.3 Run `npm run test` and fix any issues
- [ ] 6.4 Run `npm run test:e2e` and fix any issues
- [ ] 6.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 6.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
