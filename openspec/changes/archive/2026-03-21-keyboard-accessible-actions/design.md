## Context

Article action buttons (hide, save/bookmark) are rendered inside `ArticleActionButtons` with `className="hidden gap-1 group-hover:flex"`. This means:

1. **Touch devices** — buttons never appear because hover events do not fire reliably on touch-only devices. Swipe gestures exist but the visual buttons are hidden.
2. **Keyboard users** — buttons are invisible because there is no focus-based trigger. The H/S keyboard shortcuts require `getHoveredArticleId()` from `useArticleKeyboardShortcuts`, which depends on `onMouseEnter`/`onMouseLeave` event handlers in the article wrapper.
3. **The eslint-disable** for `jsx-a11y/no-static-element-interactions` on the hover-tracking `<div>` in `feed-page.tsx` (line 166) is a direct symptom: a non-interactive element has mouse event handlers but no keyboard equivalent.

The `<article>` element in `article-card.tsx` is not focusable — it has no `tabindex`. Keyboard users can only tab to the link inside the card, which does not trigger the `group-hover` or set the hovered article ID.

## Goals / Non-Goals

**Goals:**
- Make action buttons visible and operable for keyboard-only users (WCAG 2.1.1 compliance)
- Make action buttons visible on touch-only devices without relying on hover
- Enable H/S keyboard shortcuts to work on the focused article, not just the hovered one
- Remove the `eslint-disable` comment by making the wrapper properly interactive
- Maintain current hover behavior for mouse users (no visual regression)

**Non-Goals:**
- Redesigning the action button layout or adding new actions
- Adding roving tabindex or arrow-key navigation across the article list
- Changing swipe gesture behavior on touch devices
- Adding screen reader announcements for action results (future enhancement)

## Decisions

### 1. Use `group-focus-within:flex` alongside `group-hover:flex`

**Decision:** Change the `ArticleActionButtons` container class from `hidden gap-1 group-hover:flex` to `hidden gap-1 group-hover:flex group-focus-within:flex`.

**Rationale:** Tailwind's `group-focus-within:` variant mirrors the existing `group-hover:` pattern. When any focusable element inside the card (the card itself or the article link) receives focus, the action buttons become visible. This is a one-line CSS change with no JavaScript.

**Alternative considered:** Using a state variable (`isFocused`) managed by `onFocus`/`onBlur` handlers — rejected because it adds unnecessary state and re-renders when CSS can handle it declaratively.

### 2. Make article cards focusable with `tabindex="0"`

**Decision:** Add `tabindex="0"` and `role="article"` to the `<article>` element in `article-card.tsx`, along with a visible focus ring (`focus-within:ring-2 focus-within:ring-ring`).

**Rationale:** The `<article>` element is not focusable by default. Adding `tabindex="0"` puts it in the natural tab order, letting keyboard users Tab through articles. The focus ring provides the required visible focus indicator (WCAG 2.4.7). Using `focus-within` for the ring means it also appears when the inner link is focused.

**Alternative considered:** Only making the inner link focusable and propagating focus-within upward — rejected because the card itself needs to be focusable for the keyboard shortcuts to identify which article is targeted.

### 3. Track focused article ID alongside hovered article ID

**Decision:** Add `onFocus`/`onBlur` handlers on the article wrapper in `feed-page.tsx` that set a `focusedArticleRef` (similar to the existing `hoveredArticleRef`). Update `useArticleKeyboardShortcuts` to accept a `getFocusedArticleId` callback and fall back: focused article takes priority, then hovered article.

**Rationale:** The keyboard shortcuts need to know which article the user is interacting with. Mouse users hover; keyboard users focus. By checking focused first, keyboard users get reliable shortcut behavior. The fallback to hovered preserves existing mouse behavior.

**Alternative considered:** Merging hovered and focused into a single "active article" ref — rejected because hover and focus can coexist (user hovers one card while another has focus) and merging them would create confusing priority conflicts.

### 4. Always-visible action buttons on touch devices via `@media (hover: none)`

**Decision:** Add a Tailwind custom variant or utility class that applies `@media (hover: none)` to show action buttons unconditionally on touch-only devices. The buttons will render in a compact inline layout (smaller icons, no gap expansion).

**Rationale:** On touch-only devices, neither hover nor keyboard focus is the primary interaction. The swipe gestures exist for hide/save but lack discoverability. Showing compact buttons always ensures touch users can see and tap them. The `(hover: none)` media query accurately targets devices without hover capability.

**Alternative considered:** Using JavaScript `matchMedia('(hover: none)')` to conditionally render — rejected because a CSS-only approach avoids hydration mismatches and is simpler.

## Risks / Trade-offs

- **Visual density on touch devices** — Always-visible buttons add visual noise to each card. Mitigated by using a compact layout with smaller icons that blend with the metadata row.
- **Tab order length** — Making every article card focusable increases the number of tab stops. Acceptable for now; roving tabindex (arrow-key navigation within the list) is a future enhancement that would reduce tab stops.
- **Focus ring aesthetics** — The focus ring needs to look intentional, not accidental. Using the design system's `ring` color token ensures consistency.
- **Two refs for article identification** — Having both `hoveredArticleRef` and `focusedArticleRef` adds minor complexity to the feed page. The alternative (single ref) creates worse UX edge cases.
