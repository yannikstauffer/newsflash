## Context

The feed page currently has two control rows:
1. **FilterBar** — Hidden toggle, search input, refresh button
2. **DayPaginationHeader** — prev/date/next navigation, "All articles" toggle

The user wants to consolidate into a single bar with: `[All articles] [Hidden] — centered [< date >] — [search]`, and remove the refresh button.

## Goals / Non-Goals

**Goals:**
- Merge day pagination and filter controls into a single `FilterBar` component
- Position "All articles" toggle to the left of "Hidden" toggle
- Center the prev / date / next controls
- Remove the refresh button

**Non-Goals:**
- Changing filtering logic or day pagination behavior
- Redesigning the search input
- Adding new controls or features

## Decisions

**Merge DayPaginationHeader into FilterBar** — Rather than keeping two components and just rearranging, absorb the day pagination props into `FilterBar`. This eliminates the second row and keeps all toolbar logic in one place. `DayPaginationHeader` can be deleted since it has no other consumers.

**Layout approach: flex with centered middle section** — Use a three-section flex layout: left (toggles), center (day nav, absolutely positioned or flex-1 with justify-center), right (search). This ensures the date navigation stays visually centered regardless of left/right content width.

**Remove refresh button entirely** — Remove the `refreshButton` prop and `RefreshButton` usage in `FeedPage`. The component file itself stays since it could be used elsewhere, but it's currently only used here so it can be deleted too.

## Risks / Trade-offs

- **Wider single bar on mobile** — Combining everything into one row may overflow on narrow screens. Mitigation: use `flex-wrap` so controls wrap gracefully on small viewports, keeping the same responsive behavior.
- **Removing refresh** — Users lose one-click refresh without full page reload. This is acceptable per the user's decision.
