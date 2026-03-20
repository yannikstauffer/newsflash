## Why

There is no unified way to follow news across multiple sources (digitec, galaxus, SRF, WinFuture, Engadget, Heise, Ubergizmo). Switching between 7 different sites is time-consuming. A single aggregated feed with filtering, search, and article management (hide/save for later) would streamline daily news consumption.

## What Changes

- Add a **Connector system** for fetching and normalizing RSS/Atom feeds from 7 sources into a unified article format
- Add a **Vite dev proxy** to bypass CORS restrictions when fetching RSS feeds, designed to be swappable to an edge function for deployment
- Build a **unified chronological feed** displaying normalized articles from all enabled sources
- Add **filtering** by source and language (DE/EN), plus a text search over title and description
- Add **article state management**: hide articles (swipe right / hover button), save to Read List (swipe left / hover button), with localStorage persistence
- Add **mobile swipe gestures** (right to hide, left to save) and **desktop equivalents** (hover icon buttons + keyboard shortcuts)
- Add **feed configuration UI** to toggle pre-defined feeds on/off, with preferences stored in localStorage
- Article cards link to the original source; action buttons stop event propagation

## Capabilities

### New Capabilities

- `feed-connectors`: Connector interface and per-source modules (digitec, galaxus, srf, winfuture, engadget, heise, ubergizmo) that fetch and normalize RSS/Atom feeds into a unified article schema
- `feed-proxy`: Vite dev proxy configuration for RSS feed requests, abstractable behind a single fetch function for future edge function swap
- `article-feed`: Unified chronological feed view with URL-based deduplication, manual refresh, and article cards linking to original sources
- `feed-filtering`: Source filter, language filter (DE/EN), "Show hidden" toggle, and client-side text search over article title and description
- `article-actions`: Hide and Read List article states with swipe gestures (mobile), hover buttons and keyboard shortcuts (desktop), and localStorage persistence
- `feed-configuration`: UI to toggle pre-defined feeds on/off, with preferences persisted in localStorage

### Modified Capabilities

(none — fresh project)

## Impact

- **New feature modules**: `src/features/connectors/`, `src/features/feed/`, `src/features/article-actions/`, `src/features/feed-config/`
- **Vite config**: Proxy configuration for RSS feed endpoints
- **Dependencies**: RSS/Atom XML parser (e.g., `fast-xml-parser`), gesture library (e.g., `@use-gesture/react`)
- **localStorage**: Used for feed preferences, hidden article IDs, and read list article IDs
- **No backend**: Entirely client-side, proxy is dev-server only for now
