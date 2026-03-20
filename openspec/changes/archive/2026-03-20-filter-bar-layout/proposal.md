## Why

The filter bar and day pagination controls are currently split across two separate rows with suboptimal ordering. The "All articles" toggle lives in the day pagination header but logically groups with the "Hidden" toggle. The refresh button is redundant since a page reload achieves the same result. Consolidating these controls into a single, well-organized bar improves scannability and reduces vertical space.

## What Changes

- Move the "All articles" toggle from `DayPaginationHeader` into `FilterBar`, positioned to the left of the "Hidden" toggle
- Center the prev / date / next day pagination controls within the bar
- Remove the refresh button from the filter bar (users can reload the page instead)
- Merge `DayPaginationHeader` functionality into `FilterBar` to create a single unified control bar

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `filter-bar-refinement`: Layout changes — "All articles" toggle added, refresh button removed, day pagination controls merged and centered

## Impact

- `src/features/feed/components/filter-bar.tsx` — Major layout changes, new props for day pagination and "all articles" toggle, remove refresh button prop
- `src/features/feed/components/day-pagination-header.tsx` — May be removed or significantly reduced
- `src/features/feed/components/feed-page.tsx` — Updated prop wiring between components
- `src/features/feed/components/refresh-button.tsx` — No longer used in filter bar (may still be used elsewhere)
