## Context

The article card (`article-card.tsx`) currently renders metadata (source, time, category) below the headline. Time uses `formatRelativeTime` from `format-time.ts`. The card uses a CSS grid with optional thumbnail on the left.

## Goals / Non-Goals

**Goals:**
- Move metadata line above the headline for better scannability
- Replace relative time with absolute time in two responsive formats
- Lowercase source and category text; hide category on mobile

**Non-Goals:**
- Changing the card grid layout or thumbnail positioning
- Dark mode styling adjustments
- Changing the card's hover/interaction behavior

## Decisions

### 1. Two standalone format functions instead of a single parameterized one

Create `formatAbsoluteTime(date: Date): string` and `formatShortTime(date: Date): string` as separate exports. Both use manual zero-padded string formatting (no `Intl.DateTimeFormat`) for exact control over the `dd.MM.yyyy hh:mm:ss` and `dd.MM. hh:mm` formats.

**Why not Intl.DateTimeFormat?** The required formats (trailing dot after month in short format, specific separator patterns) don't map cleanly to any locale. Manual formatting is simpler and more predictable here.

**Why not one function with a `short` flag?** Two functions are clearer at the call site and independently testable. The formats are different enough that a flag adds complexity without benefit.

### 2. Responsive category visibility via Tailwind `hidden md:inline`

Use Tailwind utility classes to hide the category and its preceding dot on mobile. Wrap category content in a span with `hidden md:inline` rather than using a media query hook or JavaScript-based responsive logic.

**Why?** CSS-only approach is simpler, has zero runtime cost, and follows the existing pattern in the codebase.

### 3. Lowercase via CSS `lowercase` class

Apply Tailwind's `lowercase` utility to the metadata container rather than transforming strings in JavaScript. This keeps the original data intact and is purely presentational.

### 4. Remove `formatRelativeTime` entirely

Since no other component uses `formatRelativeTime`, it can be deleted along with its tests. The new functions replace it completely.

## Risks / Trade-offs

- **Longer metadata line on desktop** — absolute timestamps are wider than relative ones. Mitigated by hiding category on mobile and by the metadata being on its own line above the headline.
- **Trailing dot in short format** (`20.03. 14:32`) — slightly unconventional but matches the user's explicit requirement.
