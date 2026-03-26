## Context

The filter bar (`filter-bar.tsx`) renders two rows: Row 1 has refresh status, article count, toggle buttons, and search; Row 2 has day navigation. Both the refresh text and article counter live inside FilterBar. The parent `FeedPage` simply renders `<FilterBar>` then `<FeedList>` inside a `space-y-4` container.

The search icon button uses `variant="ghost"` while toggle buttons use `variant="outline"` with `rounded-full`. Toggle buttons use `size="sm"` which has asymmetric padding when icons have `data-icon="inline-start"`, causing off-center icons on mobile where labels are hidden.

## Goals / Non-Goals

**Goals:**
- Sticky filter bar that stays visible while scrolling
- Article counter remains visible in the sticky bar; refresh timestamp scrolls away
- Consistent button styling across all filter bar controls
- Properly centered icons in mobile icon-only buttons

**Non-Goals:**
- Redesigning the overall filter bar layout or adding new controls
- Changing desktop search input behavior
- Adding scroll-based animations or progressive disclosure

## Decisions

### 1. Sticky positioning via `sticky top-0` on the filter bar wrapper

Use CSS `sticky` rather than `fixed`. Sticky stays in document flow and respects the parent scroll container, avoiding the need to calculate offsets for content below.

Add `z-10` to layer above scrolling cards, `bg-background` to prevent content bleed-through, and a subtle `border-b border-border` separator.

**Alternative considered:** `position: fixed` — requires explicit top padding on the content area to compensate, and doesn't work well if the filter bar height changes (e.g., day nav appearing/disappearing).

### 2. Move "Refreshed just now" to FeedPage

Extract `lastRefreshedAt` from `filterBarProps` and render it in `FeedPage` between `<FilterBar>` and `<FeedList>`. This is a status line, not a filter control, so it belongs outside the sticky bar.

The `FeedPage` container changes from `space-y-4` to explicit layout with the refresh text as a centered, muted line between the filter bar and the article list.

**Alternative considered:** Render inside FilterBar but outside the sticky wrapper — adds complexity to FilterBar's DOM structure for no benefit.

### 3. Hardcode "just now" in formatRelativeTime

For the <60s case, return the literal string `"just now"` instead of `rtf.format(0, "second")`. The Intl output for 0 seconds varies across locales and "just now" is more natural.

When i18n is added later, this can be replaced with a translation key.

### 4. Match search icon button to toggle button styling

Change the mobile search button from `variant="ghost" size="icon-sm"` to `variant="outline" size="sm"` with `rounded-full` and the same `min-h-[44px] min-w-[44px]` sizing. This makes it visually consistent with the "All articles" and "Hidden" buttons.

### 5. Fix icon centering with responsive padding

The `size="sm"` variant applies `has-data-[icon=inline-start]:pl-1.5` but leaves `pr-2.5` from `px-2.5`, creating asymmetric padding when the label is hidden on mobile. Add `max-md:px-3` (or equivalent) to the toggle button className to force symmetric padding on mobile viewports where labels are hidden.

## Risks / Trade-offs

- **Sticky bar viewport cost on small screens**: ~96px when day nav is visible (~14% of iPhone SE height). Acceptable since the controls are frequently used. When "All articles" is active, it drops to ~48px.
- **"just now" hardcoded string**: Not locale-aware. Low risk since the app currently only targets English, and this can be swapped for a translation key when i18n lands.
- **Removing refresh text from FilterBar**: Existing tests that assert refresh text inside FilterBar will need updating. The text moves to FeedPage, so test coverage shifts rather than disappears.
