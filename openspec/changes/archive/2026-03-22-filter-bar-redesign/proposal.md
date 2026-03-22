## Why

The filter bar is cramped on mobile — full-text buttons, an always-visible search input, and day navigation all competing for a single row. The "Refreshed" status is buried at the end, and there's no article count to give users instant feedback on their filters. The layout needs a clearer information hierarchy that scales from 320px to desktop.

## What Changes

- **Icon-only buttons on mobile**: "All articles" and "Hidden" toggle buttons show only icons (`List`, `Eye`/`EyeOff`) on mobile, expanding to icon + text on `md:` breakpoint.
- **Collapsible search on mobile**: Search becomes an icon button on mobile that expands full-width on tap, hiding other row-1 controls. Active search indicated by visual accent on collapsed icon. Always visible on desktop.
- **"Refreshed" + article count on the left**: Move refresh status to the left side of row 1, paired with a new article count. Count shows non-hidden articles; when "show hidden" is active, annotates with hidden count (e.g., "14 + 3 hidden").
- **Day navigation in dedicated second row**: Move `◀ date ▶` to a centered second row below filters. Only visible when not in "All articles" mode.
- **Clear button (✕) in search**: Clears text if present; on mobile, closes/collapses the search bar if empty.

## Capabilities

### New Capabilities

- `filter-bar-responsive-layout`: Two-row responsive layout with icon-only mobile buttons, collapsible search, left-aligned status, and article count display.

### Modified Capabilities

- `filter-bar-refinement`: Layout changes from single-row to two-row; search input becomes collapsible on mobile; refresh status repositioned to left.
- `feed-filtering`: Article count display derived from existing filter pipeline; hidden count annotation when show-hidden is active.

## Impact

- **Code**: `src/features/feed/components/filter-bar.tsx` (primary), `src/features/feed/hooks/use-feed-page.ts` (article count + search open state), `src/features/feed/components/feed-page.tsx` (pass new props)
- **Dependencies**: `lucide-react` — add `List`, `X` icon imports (already a project dependency)
- **Testing**: Update existing filter-bar tests, add tests for collapsible search behavior, article count display, and responsive icon-only rendering
