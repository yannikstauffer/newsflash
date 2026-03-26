## 1. Fix refresh timestamp wording

- [x] 1.1 In `src/features/feed/utils/format-time.ts`, change the <60s case in `formatRelativeTime()` to return `"just now"` instead of `rtf.format(0, "second")`
- [x] 1.2 Update unit tests for `formatRelativeTime` to expect `"just now"` for the <60s case

## 2. Move refresh text out of FilterBar

- [x] 2.1 Remove `lastRefreshedAt` from `FilterBarProps` interface and all refresh text rendering from `filter-bar.tsx` (both mobile and desktop sections)
- [x] 2.2 In `feed-page.tsx`, extract `lastRefreshedAt` from the feed page hook and render "Refreshed {time}" as a centered, muted text line between `<FilterBar>` and `<FeedList>`
- [x] 2.3 Update `use-feed-page.ts` to expose `lastRefreshedAt` separately (not inside `filterBarProps`)
- [x] 2.4 Update existing FilterBar tests that assert refresh text presence

## 3. Make filter bar sticky

- [x] 3.1 Add `sticky top-0 z-10 bg-background border-b border-border` to the filter bar's root `<div>` in `filter-bar.tsx`
- [x] 3.2 Adjust `feed-page.tsx` container layout if needed to ensure sticky works correctly within the scroll container

## 4. Fix search icon button styling

- [x] 4.1 Change the mobile search icon button from `variant="ghost" size="icon-sm"` to `variant="outline" size="sm"` with `rounded-full` and matching `min-h-[44px] min-w-[44px]` sizing
- [x] 4.2 Verify the active state styling (`bg-accent text-accent-foreground` when search has text) still works with the new variant

## 5. Fix icon centering on mobile toggle buttons

- [x] 5.1 Add responsive symmetric padding override (e.g., `max-md:px-3`) to the "All articles" and "Hidden" toggle button classNames so icons are centered when labels are hidden on mobile
- [x] 5.2 Ensure the search icon button also has symmetric padding on mobile

## 6. Testing

- [x] 6.1 Add or update unit tests for FilterBar to verify article counter is rendered and refresh text is absent
- [x] 6.2 Add or update unit tests for FeedPage to verify refresh text is rendered between filter bar and article list
- [x] 6.3 Add or update E2E test to verify the filter bar remains visible (sticky) when scrolling through articles

## 7. Quality Gates

- [x] 7.1 Run `npm run lint` and fix any issues
- [x] 7.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 7.3 Run `npm run test` and fix any issues
- [x] 7.4 Run `npm run test:e2e` and fix any issues
- [x] 7.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 7.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
