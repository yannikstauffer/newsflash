## Context

The Newsflash SPA has four WCAG Level AA compliance gaps identified during accessibility review:

1. **No skip-to-content link** — Keyboard users must tab through the entire navigation bar on every page load before reaching the main content area (`src/app/app-layout.tsx`).
2. **OS theme preference ignored** — `useThemePreference` defaults to `"light"` regardless of the user's OS `prefers-color-scheme` setting (`src/hooks/use-theme-preference.ts`).
3. **Reversed chevron semantics** — In `FilterBar`, the left-pointing chevron (`ChevronLeft`) calls `onNext` and is labelled "Next day", while the right-pointing chevron (`ChevronRight`) calls `onPrev` and is labelled "Previous day". This contradicts the visual direction for LTR layouts (`src/features/feed/components/filter-bar.tsx`).
4. **Unbounded search input** — The search input has no `maxLength`, allowing arbitrarily long strings that could degrade filtering performance (`src/features/feed/components/filter-bar.tsx`).

## Goals / Non-Goals

**Goals:**

- Close all four identified WCAG gaps (W2, W3, W4, S2)
- All fixes are backward-compatible with no user-visible behavior regressions
- Keep changes minimal and localized to the affected files

**Non-Goals:**

- Full WCAG audit or automated accessibility testing infrastructure (separate effort)
- RTL layout support for chevron direction
- Theme system redesign or system-follows-OS live-toggling (only initial default changes)

## Decisions

### 1. Skip-to-content link implementation

Place a visually-hidden anchor as the first child inside the root `<div>` of `AppLayout`. The link uses Tailwind's `sr-only` plus `focus:not-sr-only` utilities so it appears only when focused via keyboard. The target is `<main id="main-content">`.

**Alternative considered:** Using a CSS-only approach with `:focus-within` on a wrapper. Rejected because the anchor approach is the universally recognized pattern and requires no extra markup complexity.

### 2. OS color-scheme detection

In `useThemePreference`, when localStorage has no saved value for the theme key, use `window.matchMedia("(prefers-color-scheme: dark)")` to determine the initial default. If the media query matches, default to `"dark"`; otherwise keep `"light"`. Once the user explicitly sets a preference, localStorage takes precedence on all subsequent visits.

**Alternative considered:** Adding a `"system"` theme option that live-tracks OS changes. Rejected as out of scope — the current toggle is binary (light/dark), and adding a third state would require UI changes beyond this fix.

### 3. Chevron label and handler correction

Swap the `onClick` handlers and `aria-label` values so that `ChevronLeft` triggers `onPrev` with label "Previous day" and `ChevronRight` triggers `onNext` with label "Next day". The icons remain in their current positions.

**Alternative considered:** Swapping the icons instead of the handlers. Either approach works, but swapping handlers/labels is a smaller diff and keeps the icon import order unchanged.

### 4. Search input maxLength

Add `maxLength={200}` to the search `<input>`. This is a reasonable upper bound that prevents performance issues without restricting legitimate searches.

## Risks / Trade-offs

- **[Risk] OS theme flash on first load** — If the user prefers dark mode but the HTML initially renders without the `dark` class, there may be a brief flash of light theme. → Mitigation: The `useEffect` in `useThemePreference` runs synchronously enough in practice (React 19 concurrent mode) that the flash is negligible. A future improvement could use a blocking `<script>` in `index.html`.
- **[Risk] Chevron swap could confuse existing users** — Users who learned the reversed mapping may be briefly disoriented. → Mitigation: The current mapping is objectively wrong for LTR layouts; correcting it aligns with user expectations.
