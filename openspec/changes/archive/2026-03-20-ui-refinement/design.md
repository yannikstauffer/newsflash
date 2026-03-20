## Context

Newsflash is a Vite 8 + React 19 SPA that aggregates RSS feeds from 7 sources (13 feeds total). The feed page displays article cards with title, source, relative time, category, description, and optional thumbnail. Currently, RSS `<description>` content is rendered as raw text including HTML tags, making articles unreadable. The UI lacks visual polish — cards are plain bordered boxes, the filter bar is dense, and spacing is inconsistent.

## Goals / Non-Goals

**Goals:**
- Clean, readable article descriptions with no visible HTML tags
- Polished article card design with consistent layout and visual hierarchy
- Better-organized filter bar with clear grouping and responsive behavior
- Consistent spacing, typography, and subtle visual effects across the feed page

**Non-Goals:**
- Rendering rich HTML content in descriptions (we strip to plain text)
- Adding new features (dark mode toggle, infinite scroll, etc.)
- Changing data fetching, routing, or state management
- Redesigning the Settings or Read List pages

## Decisions

### 1. HTML stripping via DOMParser API

**Decision:** Use the browser's `DOMParser` to parse HTML and extract `textContent`, rather than regex or a library like DOMPurify.

**Rationale:** We only need plain text extraction, not safe HTML rendering. `DOMParser` is built-in, zero-dependency, and handles all edge cases (entities, nested tags, malformed HTML). Regex-based stripping is fragile. DOMPurify is overkill since we never render HTML.

**Alternative considered:** Regex `/<[^>]*>/g` — breaks on malformed HTML, doesn't decode entities.

### 2. Strip HTML at parse time in base-parser

**Decision:** Strip HTML in `base-parser.ts` when constructing `NormalizedArticle.description`, not at render time.

**Rationale:** Every consumer of the description (card, search, read list) benefits from clean text. Stripping once at parse time is more efficient and prevents the raw HTML from leaking into any view.

### 3. Card layout with CSS Grid

**Decision:** Use a simple CSS grid (`grid-cols-[1fr_auto]`) for the article card to place content and thumbnail side by side consistently.

**Rationale:** Current flex layout causes inconsistent spacing when thumbnails are present vs absent. Grid with `auto` column for the optional image simplifies alignment.

### 4. Filter bar grouping

**Decision:** Group source buttons on one row, then language/hidden/search on a second row. Use `flex-wrap` for source buttons on narrow screens.

**Rationale:** Currently all filters compete for horizontal space. Two rows give each group breathing room. Source buttons wrap naturally on mobile since they're toggle chips.

## Risks / Trade-offs

- **[HTML stripping loses useful content]** → Some descriptions may contain links or formatting that adds value. Mitigation: The article link is always available; users click through for full content.
- **[DOMParser in non-browser environments]** → Tests run in jsdom which supports DOMParser. No SSR planned. Mitigation: Add a regex fallback if DOMParser is unavailable.
- **[Visual changes may not match user expectations]** → Mitigation: Implement incrementally, verify with screenshots at each step.
