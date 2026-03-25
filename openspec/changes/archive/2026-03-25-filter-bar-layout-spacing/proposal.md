## Why

On mobile, the "Refreshed X ago" text and article count are visually merged in a single left-aligned group, making it hard to distinguish them at a glance. The article count and filter buttons should form a right-aligned cluster, creating clear visual separation from the refresh status and a more balanced layout.

## What Changes

- Split the filter bar's status area into two groups: "Refreshed..." on the left, article count + filter buttons on the right
- Add `ml-auto` to push the right cluster to the end of the row
- Use tighter spacing (`gap-1.5`) on mobile and wider spacing (`md:gap-3`) on desktop between article count and filter buttons
- When `lastRefreshedAt` is null, the right cluster remains right-aligned

## Capabilities

### New Capabilities

- `filter-bar-split-layout`: Restructure filter bar Row 1 so refresh status is left-aligned and article count + toggles form a right-aligned cluster with responsive spacing

### Modified Capabilities

None

## Impact

- `src/features/feed/components/filter-bar.tsx` — restructure JSX in the non-search branch (lines ~146–217)
- No API, dependency, or data model changes
- Visual-only change; no logic changes