## 1. Two-Row Layout Structure

- [ ] 1.1 Refactor filter-bar.tsx outer wrapper from single `flex-wrap` row to `flex flex-col gap-2` with two explicit rows
- [ ] 1.2 Move day navigation into dedicated row 2 with `justify-center` alignment
- [ ] 1.3 Move "Refreshed" status text from end of bar to left side of row 1

## 2. Icon-Only Buttons on Mobile

- [ ] 2.1 Add `List` icon import from lucide-react and add it to the "All articles" button
- [ ] 2.2 Wrap button text labels in `<span className="hidden md:inline">` so they hide on mobile
- [ ] 2.3 Add `aria-label` attributes to both toggle buttons for screen reader accessibility when text is hidden

## 3. Article Count Display

- [ ] 3.1 Compute `articleCount` (non-hidden) and `hiddenCount` in `useFeedPage` hook from filtered results
- [ ] 3.2 Pass `articleCount` and `hiddenCount` as new props to FilterBar
- [ ] 3.3 Render article count next to refresh status on the left — show "{count} articles" normally, "{visible} + {hidden} hidden" when showHidden is active

## 4. Collapsible Search on Mobile

- [ ] 4.1 Add `searchOpen` state to FilterBar component
- [ ] 4.2 Render search icon button (mobile only, `md:hidden`) that sets `searchOpen = true`
- [ ] 4.3 When `searchOpen` is true on mobile, render full-width search input and hide status/toggle controls
- [ ] 4.4 Auto-focus search input when expanded
- [ ] 4.5 Add visual indicator (accent color) on search icon button when search query is active but collapsed

## 5. Clear Button (✕)

- [ ] 5.1 Add `X` icon import from lucide-react
- [ ] 5.2 Render clear button inside search input when text is present or input has focus
- [ ] 5.3 On click: clear text if present; on mobile with empty text, collapse search bar
- [ ] 5.4 Handle Escape key to collapse search on mobile

## 6. Desktop Search (Always Visible)

- [ ] 6.1 Ensure search input renders persistently on `md:` and above using `hidden md:flex` regardless of `searchOpen` state

## 7. Testing

- [ ] 7.1 Unit tests for icon-only rendering on mobile vs icon+text on desktop
- [ ] 7.2 Unit tests for article count display (normal and hidden annotation)
- [ ] 7.3 Unit tests for search expand/collapse behavior and clear button
- [ ] 7.4 Unit tests for two-row layout and day navigation positioning
- [ ] 7.5 Update existing filter-bar tests for new prop interface (articleCount, hiddenCount)
