## 1. Article card focusability

- [x] 1.1 Add `tabindex="0"` to the `<article>` element in `src/features/feed/components/article-card.tsx`
- [x] 1.2 Add focus-within ring styling to the `<article>` element (`focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1`)
- [x] 1.3 Verify tab navigation cycles through article cards in document order

## 2. Action button visibility on focus

- [x] 2.1 Change `ArticleActionButtons` container class from `hidden gap-1 group-hover:flex` to `hidden gap-1 group-hover:flex group-focus-within:flex` in `src/features/article-actions/components/article-action-buttons.tsx`
- [x] 2.2 Verify action buttons appear when an article card receives keyboard focus
- [x] 2.3 Verify action buttons disappear when focus leaves the card and its children

## 3. Touch device always-visible buttons

- [x] 3.1 Add a Tailwind custom variant or inline `@media (hover: none)` utility to show action buttons unconditionally on touch-only devices
- [x] 3.2 Apply compact styling (reduced spacing, smaller touch target on desktop-sized screens) for the always-visible touch layout
- [x] 3.3 Verify buttons are permanently visible on a device/emulation with `(hover: none)`

## 4. Keyboard shortcuts for focused articles

- [x] 4.1 Add `focusedArticleRef` to `feed-page.tsx` alongside the existing `hoveredArticleRef`
- [x] 4.2 Add `onFocus`/`onBlur` handlers on the article wrapper in `feed-page.tsx` to track the focused article ID
- [x] 4.3 Update `useArticleKeyboardShortcuts` interface to accept `getFocusedArticleId` callback
- [x] 4.4 Update shortcut resolution logic: check `getFocusedArticleId()` first, fall back to `getHoveredArticleId()`
- [x] 4.5 Remove the `eslint-disable` comment for `jsx-a11y/no-static-element-interactions` in `feed-page.tsx`

## 5. Tests

- [x] 5.1 Add unit test: `ArticleActionButtons` is visible when parent has focus-within
- [x] 5.2 Add unit test: keyboard shortcut uses focused article ID when available
- [x] 5.3 Add unit test: keyboard shortcut falls back to hovered article ID when no focus
- [x] 5.4 Add unit test: `article-card` renders with `tabindex="0"`
- [x] 5.5 Run existing tests to confirm no regressions (`npm run test`)

## 6. Verify

- [x] 6.1 Run linting (`npm run lint`) on all changed files
- [x] 6.2 Run TypeScript check (`npx tsc --noEmit`)
- [ ] 6.3 Manual keyboard-only walkthrough: tab through feed, trigger H/S shortcuts, confirm buttons appear on focus
- [ ] 6.4 Manual touch emulation: confirm buttons are always visible with `(hover: none)` in DevTools
