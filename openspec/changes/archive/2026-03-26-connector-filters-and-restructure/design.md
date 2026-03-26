## Context

The `src/features/connectors/` folder contains both generic infrastructure (`types.ts`, `base-parser.ts`, `registry.ts`, `fetch-feed.ts`) and 7 connector implementations (`*-connector.ts`) in a flat structure. Article filtering currently operates downstream in `filterArticles()` with feed-level toggles, search, and hidden article state — but has no awareness of source-specific content patterns (paid articles, promotions, downloads, content categories).

Key existing patterns:
- `Connector` interface: `{ id, name, language, feeds, parse() }`
- `useFeedPreferences` hook: localStorage-backed with `store[feedId] !== false` default
- `filterArticles()`: sequential filter checks (feed enabled → hidden → search)
- Settings UI: checkbox per feed with indeterminate state for partial source selection

## Goals / Non-Goals

**Goals:**
- Clean separation between connector infrastructure and implementations
- Extensible filter system defined at the connector level
- User-toggleable filters with same UX pattern as feed toggles (checked = shown)
- Filters for heise (heise+, heise-Angebot), digitec/galaxus (7 categories each), winfuture (downloads)

**Non-Goals:**
- Dynamic filter discovery from feed XML at runtime (filters are statically defined in connectors)
- Filter composition or chaining (each filter operates independently)
- Per-connector subfolder structure (all implementations stay as flat files in `sources/`)
- i18n for filter labels (labels stay in source language)

## Decisions

### 1. Folder structure: flat `sources/` subfolder

Move connector implementations into `src/features/connectors/sources/` as flat files. No per-connector subdirectories.

**Why:** Connectors are single-file today and filters are defined inline. Per-connector folders would be over-engineering until connectors need multiple files (custom parsers, fixtures, etc.).

**Alternative considered:** Per-connector folders (`sources/heise/connector.ts`). Rejected — adds nesting complexity without current benefit.

### 2. Filter interface with `match` function

```typescript
interface ArticleFilter {
  readonly id: string
  readonly label: string
  readonly enabledByDefault: boolean
  readonly match: (article: NormalizedArticle) => boolean
}
```

Each filter has a `match` function that returns `true` if the article belongs to the filtered category. When the filter is **disabled** (unchecked in settings), matching articles are excluded.

**Why:** The `match` function gives each connector full flexibility — heise checks title prefixes, digitec checks categories, winfuture checks URLs. A declarative approach (e.g., `{ field: "title", pattern: "heise+" }`) would be too rigid and require expanding the schema for each new pattern type.

**Alternative considered:** Declarative filter config with field/pattern pairs. Rejected — can't handle multi-field or complex matching without growing the schema.

### 3. Unified checkbox semantic with feeds

Filters use the same mental model as feeds: **checked = content shown, unchecked = content hidden**. The `enabledByDefault` property determines initial checkbox state.

**Why:** Users already understand the feed checkbox pattern. Reusing it avoids cognitive overhead. A filter with `enabledByDefault: false` (like heise+) starts unchecked — users opt in by checking it.

### 4. Separate `useFilterPreferences` hook

New hook with its own localStorage key `"newsflash:filter-prefs"`, mirroring `useFeedPreferences`.

**Why:** Keeps filter state independent of feed preferences. Same proven pattern, no risk of key collisions. The hook needs to handle the `enabledByDefault` flag, which `useFeedPreferences` doesn't support.

**Lookup logic:**
- `enabledByDefault: true` → `store[filterId] !== false` (shown unless explicitly disabled)
- `enabledByDefault: false` → `store[filterId] === true` (hidden unless explicitly enabled)

### 5. Filter application in existing `filterArticles()`

Extend `FilterOptions` with connector filter data rather than creating a separate filter step. The function receives the list of connectors and a `isFilterEnabled` callback, then for each article looks up its connector's filters.

**Why:** Keeps all article filtering in one place. Adding a separate pipeline step would fragment the filter logic and require passing articles through an additional function in `useFeedPage`.

### 6. Settings UI: filter section per connector

Filters render below the feed list within each connector's settings section. Only shown when the connector has filters defined. Each filter is a checkbox with the same styling as feed toggles.

**Why:** Filters are connector-specific, so grouping them under their connector is natural. No separate "Filters" settings section needed.

## Risks / Trade-offs

- **Filter `match` runs per-article per-filter on every render cycle** → Acceptable for current scale (~100 articles × ~17 filters max). If article count grows significantly, consider memoizing filter results.
- **Static filter definitions may miss new content patterns** → Acceptable trade-off vs. dynamic discovery complexity. New patterns require a code change to add a filter.
- **WinFuture URL-based filter is brittle if URL structure changes** → Low risk, URL patterns have been stable. Easy to update if needed.
- **Galaxus and digitec share identical category sets today** → If they diverge, filters are independently defined per connector so no coupling issue.
