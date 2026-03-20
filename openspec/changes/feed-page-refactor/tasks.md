## 1. Stabilize dependencies

- [ ] 1.1 Wrap `refresh` in `useCallback` inside `useFeedData` so the reference is stable across renders
- [ ] 1.2 Remove redundant `useCallback` wrappers for `onSwipeRight`/`onSwipeLeft` in `SwipeableCard` — pass props directly to `useDrag`

## 2. Create barrel export for article-actions

- [ ] 2.1 Create `src/features/article-actions/index.ts` re-exporting `ArticleActionButtons`, `HiddenArticleActions`, `SwipeableCard`, `useArticleKeyboardShortcuts`, `useArticleState`

## 3. Extract useFeedPage hook

- [ ] 3.1 Create `src/features/feed/hooks/use-feed-page.ts` with all state, refs, effects, `useMemo`, and `useCallback` logic extracted from `FeedPage`
- [ ] 3.2 Move hover tracking into the hook (return `onMouseEnter`/`onMouseLeave` handlers or a ref-based approach) to eliminate the `jsx-a11y/no-static-element-interactions` suppression
- [ ] 3.3 Ensure mount effect includes `refresh` in dependency array with no `eslint-disable` comment

## 4. Refactor FeedPage to use hook

- [ ] 4.1 Replace `FeedPage` body with a call to `useFeedPage()` and pure JSX rendering (~30 LOC)
- [ ] 4.2 Update imports to use the `article-actions` barrel export instead of 5 individual paths

## 5. Validate

- [ ] 5.1 Run `npm run lint` — verify zero `eslint-disable` comments remain in feed-page.tsx
- [ ] 5.2 Run `npm run test` — all unit tests pass
- [ ] 5.3 Run `npm run test:e2e` — all E2E tests pass (desktop hover, keyboard shortcuts, mobile swipe)
