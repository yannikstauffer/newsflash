## Why

Connector implementations currently share a flat folder with generic connector infrastructure (types, base-parser, registry, fetch-feed), making it harder to navigate and scale as more connectors are added. Additionally, connectors have no way to define source-specific article filters — for example, heise includes paid "heise+" articles and promotional "heise-Angebot" content in the same feed, with no mechanism to let users exclude them.

## What Changes

- **Folder restructure**: Move all connector implementation files (`*-connector.ts`) into a new `src/features/connectors/sources/` subdirectory, keeping generic infrastructure (`types.ts`, `base-parser.ts`, `registry.ts`, `fetch-feed.ts`) at the current level.
- **Article filter type system**: Add `ArticleFilter` interface and optional `filters` property to the `Connector` interface, allowing each connector to declare filterable content patterns.
- **Connector-specific filters**:
  - Heise: `heise+` (paid, excluded by default) and `heise-Angebot` (promotions)
  - Digitec: 7 category-based filters (Produkttest, Hintergrund, Kritik, Meinung, Neu im Sortiment, Ratgeber, Hinter den Kulissen)
  - Galaxus: same 7 category-based filters as Digitec
  - WinFuture: Downloads filter (matches `downloadvorschalt` / `/download/` URLs)
- **Filter preferences persistence**: New `useFilterPreferences` hook with localStorage, following the same pattern as existing `useFeedPreferences`.
- **Pipeline integration**: `filterArticles()` extended to check connector filters against user preferences.
- **Settings UI**: Filter toggles shown per-connector in settings, using the same checkbox semantic as feeds (checked = shown, unchecked = hidden).

## Capabilities

### New Capabilities

- `connector-article-filters`: Connector-level article filter definitions, filter preference persistence, pipeline integration, and settings UI for toggling filters.
- `connector-folder-structure`: Separation of connector implementations from generic connector infrastructure into a `sources/` subdirectory.

### Modified Capabilities

- `feed-connectors`: Connector interface gains optional `filters` property.
- `feed-filtering`: `filterArticles()` extended to apply connector-level filters.
- `feed-configuration`: Settings UI extended with filter toggles per connector.

## Impact

- **Types**: `Connector` and new `ArticleFilter` interfaces in `src/features/connectors/types.ts`
- **All connector files**: Moved to `sources/` subfolder, imports updated
- **Registry**: Import paths updated to `./sources/*`
- **Filter pipeline**: `src/features/feed/utils/filter-articles.ts` gains connector filter logic
- **Settings UI**: `src/features/feed-config/components/feed-config-page.tsx` gains filter section
- **New hook**: `useFilterPreferences` in `src/features/feed-config/hooks/`
- **Tests**: Existing connector tests moved, new tests for filter matching and preferences