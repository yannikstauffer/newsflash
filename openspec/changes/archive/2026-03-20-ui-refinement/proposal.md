## Why

The feed page renders raw HTML tags (`<img>`, `<a>`) in article descriptions because RSS content is displayed as-is without sanitization or stripping. Combined with inconsistent card layouts, a dense filter bar, and lack of visual polish, the app feels unfinished. Cleaning this up makes the feed usable and visually appealing.

## What Changes

- Strip HTML from article descriptions so cards display clean plain text
- Redesign article cards with consistent thumbnail placement, better typography hierarchy, and hover states
- Refine the filter bar layout — better spacing, grouping, and responsive behavior
- Overall UI polish — improved spacing, subtle shadows, smoother transitions, and consistent visual rhythm across the page

## Capabilities

### New Capabilities
- `html-sanitization`: Utility to strip HTML tags from RSS description content and extract clean plain text for display
- `card-redesign`: Improved article card component with consistent layout, better visual hierarchy, and polished interactions
- `filter-bar-refinement`: Refined filter bar with better grouping, spacing, and responsive behavior
- `ui-polish`: Global spacing, typography, shadow, and transition improvements across the feed page

### Modified Capabilities

## Impact

- `src/features/feed/components/article-card.tsx` — card layout and styling overhaul
- `src/features/feed/components/filter-bar.tsx` — filter bar layout refinement
- `src/features/connectors/base-parser.ts` — HTML stripping at parse time (or new utility)
- `src/index.css` — potential global style adjustments
- New utility file for HTML-to-text conversion
- No new dependencies expected (use browser DOMParser API for HTML stripping)
