## Why

Several WCAG Level AA compliance gaps exist in the current UI: there is no skip-to-content link for keyboard users (W2), the theme toggle ignores the OS `prefers-color-scheme` setting (W3), the day-navigation chevron buttons have reversed aria-label semantics (W4), and the search input has no character length limit (S2). These issues degrade the experience for assistive-technology users and violate the project's stated WCAG AA requirement.

## What Changes

- Add a visually-hidden skip-to-content link at the top of `AppLayout` that becomes visible on focus, targeting `<main id="main-content">`.
- Respect the OS color-scheme preference via `matchMedia("(prefers-color-scheme: dark)")` as the default theme when no value exists in localStorage.
- Fix the day-navigation chevron buttons in `FilterBar` so that the left-pointing chevron navigates to the previous day and the right-pointing chevron navigates to the next day, aligning labels with visual direction.
- Add `maxLength={200}` to the search input in `FilterBar` to prevent unbounded input.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — these are implementation-level fixes to meet existing WCAG AA requirements, not spec-level behavior changes)

## Impact

- `src/app/app-layout.tsx` — new skip-to-content link and `id="main-content"` on `<main>`
- `src/hooks/use-theme-preference.ts` — OS color-scheme detection as default
- `src/features/feed/components/filter-bar.tsx` — chevron label/handler swap, search `maxLength`
