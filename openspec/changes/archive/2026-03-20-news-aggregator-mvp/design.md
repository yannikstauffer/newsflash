## Context

This is a greenfield Vite 8 + React 19 + TypeScript SPA with no existing features. The project follows Bulletproof React architecture with strict module boundaries enforced via ESLint. There is no backend — all logic runs in the browser. Seven news sources (mix of German and English, RSS 2.0 and Atom formats) need to be aggregated into a single feed.

## Goals / Non-Goals

**Goals:**
- Aggregate 7 RSS/Atom sources into a unified, chronological article feed
- Provide a Connector abstraction that makes adding new sources trivial (one file per source)
- Support filtering (source, language), search, and article state management (hide, read list)
- Work on mobile (swipe gestures) and desktop (hover buttons, keyboard shortcuts)
- Keep the architecture swappable from Vite dev proxy to edge function without rewriting fetch logic

**Non-Goals:**
- No backend or database — all persistence is localStorage
- No server-side rendering or static generation
- No user accounts or cross-device sync
- No automatic refresh or polling
- No full-text article content (just title, description, link from RSS)
- No deduplication beyond URL matching (no fuzzy title matching)

## Decisions

### 1. Connector Pattern for Feed Normalization

Each source gets a Connector module that implements a shared interface:

```typescript
interface Connector {
  id: string                          // "engadget", "srf", etc.
  name: string                        // Display name
  language: "de" | "en"
  feeds: FeedConfig[]                 // One or more feeds per source
  parse(xml: string): NormalizedArticle[]
}
```

A shared base parser handles standard RSS 2.0 and Atom fields. Connectors override `parse()` only when the source has quirks (e.g., Heise uses Atom, SRF has sub-feeds).

**Why over a generic parser:** Each source has subtle differences in field mapping, date formats, thumbnail extraction. The Connector pattern isolates these quirks while keeping the interface uniform. Adding a source is one file + one registry entry.

**Alternative considered:** Single generic RSS parser with config objects. Rejected because config-driven approaches become unwieldy when sources have structural differences (Atom vs RSS 2.0, nested categories, custom namespaces).

### 2. Vite Dev Proxy with Abstraction Layer

All RSS fetches go through a `fetchFeed(url: string): Promise<string>` function that prepends a configurable base path. In development, Vite proxies `/api/rss/*` to the actual feed URLs. In production, the same path would route to an edge function.

```
Development:  fetchFeed("/api/rss/engadget") → Vite proxy → engadget.com/rss.xml
Production:   fetchFeed("/api/rss/engadget") → Edge function → engadget.com/rss.xml
```

**Why:** Avoids CORS issues entirely. The abstraction means swapping the proxy backend is a config change, not a code change.

**Alternative considered:** Public CORS proxy services (allorigins, corsproxy.io). Rejected due to reliability, rate limiting, and privacy concerns.

### 3. Client-Side State with localStorage

Three persistence concerns, all in localStorage:

| Key | Content |
|-----|---------|
| `newsflash:feed-prefs` | Enabled/disabled feeds (object keyed by feed ID) |
| `newsflash:hidden` | Set of hidden article URLs |
| `newsflash:readlist` | Set of read-list article URLs |

**Why over IndexedDB or state library:** The data is small (URLs and booleans), rarely exceeds a few hundred entries, and doesn't need querying. localStorage is the simplest fit. A custom hook (`useLocalStorage`) wraps read/write with JSON serialization.

### 4. Gesture + Button Interaction Model

| Platform | Hide | Save to Read List | Open Article |
|----------|------|--------------------|--------------|
| Mobile | Swipe right | Swipe left | Tap |
| Desktop | Hover button + `H` key | Hover button + `S` key | Click |

Using `@use-gesture/react` for swipe detection. Swipe actions use `stopPropagation()` to prevent triggering navigation.

**Why `@use-gesture/react`:** Well-maintained, React-native API, handles touch/mouse/pointer events uniformly. Lighter than full animation libraries.

### 5. XML Parsing with `fast-xml-parser`

RSS/Atom feeds are XML. `fast-xml-parser` is used for parsing because:
- Zero dependencies
- Works in browser (no Node.js APIs)
- Handles both RSS 2.0 and Atom
- ~40KB gzipped

**Alternative considered:** `DOMParser` (browser built-in). Rejected because manual DOM traversal is verbose and error-prone for varying RSS/Atom structures. `fast-xml-parser` gives a clean JSON object to work with.

### 6. Feature Module Structure

```
src/features/
├── connectors/              ← Feed Connectors
│   ├── types.ts             ← Connector, NormalizedArticle, FeedConfig interfaces
│   ├── registry.ts          ← All connectors exported as array
│   ├── base-parser.ts       ← Shared RSS 2.0 + Atom parsing
│   ├── digitec-connector.ts
│   ├── galaxus-connector.ts
│   ├── srf-connector.ts
│   ├── winfuture-connector.ts
│   ├── engadget-connector.ts
│   ├── heise-connector.ts
│   └── ubergizmo-connector.ts
├── feed/                    ← Feed display + filtering + search
│   ├── components/
│   ├── hooks/
│   └── utils/
├── article-actions/         ← Hide, Read List, swipe/keyboard handling
│   ├── components/
│   ├── hooks/
│   └── utils/
└── feed-config/             ← Feed toggle UI + preference persistence
    ├── components/
    └── hooks/
```

Follows Bulletproof React and the module boundary rules from CLAUDE.md.

## Risks / Trade-offs

- **[RSS feed format changes]** → Connectors isolate breakage to one source. Base parser handles standards; only quirk-specific parsing breaks.
- **[localStorage size limits (~5MB)]** → With URL-based storage, would need ~50K+ hidden articles to approach limits. Not a concern for personal use.
- **[Vite proxy not available in production]** → Documented as known limitation. Edge function swap is designed to be a config change. Build will work but feeds won't load without a proxy.
- **[Mixed language feed creates noisy default view]** → Language filter defaults to "All" but is prominent in the UI. User can narrow quickly.
- **[No offline support]** → Articles are fetched fresh on each load. Acceptable for MVP — could add service worker caching later.
