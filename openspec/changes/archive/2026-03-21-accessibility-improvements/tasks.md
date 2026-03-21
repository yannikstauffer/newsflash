## 1. Skip-to-Content Link

- [x] 1.1 Add a visually-hidden skip-to-content anchor as the first child inside the root `<div>` of `AppLayout` in `src/app/app-layout.tsx`
- [x] 1.2 Add `id="main-content"` to the `<main>` element in `AppLayout`
- [x] 1.3 Style the link with `sr-only focus:not-sr-only` Tailwind classes so it appears on keyboard focus
- [x] 1.4 Write a test verifying the skip link is present and targets `#main-content`

## 2. OS Theme Preference Default

- [x] 2.1 Update `useThemePreference` in `src/hooks/use-theme-preference.ts` to detect OS `prefers-color-scheme` via `matchMedia` when localStorage has no saved value
- [x] 2.2 Ensure explicit user preference in localStorage overrides the OS default
- [x] 2.3 Write tests for OS dark preference, OS light preference, and saved-preference-override scenarios

## 3. Chevron Semantics Fix

- [x] 3.1 In `src/features/feed/components/filter-bar.tsx`, swap the `onClick` handlers so `ChevronLeft` calls `onPrev` and `ChevronRight` calls `onNext`
- [x] 3.2 Update `aria-label` values so `ChevronLeft` is "Previous day" and `ChevronRight` is "Next day"
- [x] 3.3 Write a test verifying the correct labels and handler associations

## 4. Search Input MaxLength

- [x] 4.1 Add `maxLength={200}` to the search `<input>` in `src/features/feed/components/filter-bar.tsx`
- [x] 4.2 Write a test verifying the `maxLength` attribute is present on the search input
