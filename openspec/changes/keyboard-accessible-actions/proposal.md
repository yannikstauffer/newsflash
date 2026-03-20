## Why

Article action buttons use `className="hidden gap-1 group-hover:flex"` making them invisible on touch devices and to keyboard users. The H/S keyboard shortcuts in `useArticleKeyboardShortcuts` require `getHoveredArticleId()` to return a value, which only happens on mouse hover (`onMouseEnter`/`onMouseLeave`). This creates a mouse-dependent interaction that is a WCAG 2.1 Level A violation (Success Criterion 2.1.1 Keyboard). The `eslint-disable` for `jsx-a11y/no-static-element-interactions` on the hover-tracking wrapper is a symptom of this gap.

## What Changes

- Make action buttons visible on `focus-within` in addition to hover by adding `group-focus-within:flex` to the button container
- Make article cards focusable with `tabindex="0"` and visible focus styling so keyboard users can navigate to them
- Update keyboard shortcuts hook to resolve the focused article ID (not just hovered), enabling H/S shortcuts without a mouse
- Show action buttons permanently in a compact layout on touch-only devices using `@media (hover: none)`
- Remove the `eslint-disable` for `jsx-a11y/no-static-element-interactions` by making the wrapper interactive (focusable)

## Capabilities

### New Capabilities

### Modified Capabilities
- `article-actions`: Action buttons SHALL be visible and operable via keyboard focus and on touch devices, not only on mouse hover

## Impact

- `src/features/article-actions/components/article-action-buttons.tsx` — add `group-focus-within:flex` and touch-device visibility classes
- `src/features/feed/components/article-card.tsx` — add `tabindex="0"` and focus ring styling to the `<article>` element
- `src/features/feed/components/feed-page.tsx` — track focused article ID alongside hovered ID, remove eslint-disable comment
- `src/features/article-actions/hooks/use-article-keyboard-shortcuts.ts` — accept `getFocusedArticleId` in addition to `getHoveredArticleId`
- `src/app/index.css` or Tailwind config — add `@media (hover: none)` utility if not already available
