## Why

Disabling SRF Sport feeds (e.g., `srf-sport`, `srf-football`, `srf-ice-hockey`) does not actually hide sport articles from the feed. The `srf-latest` ("Das Neueste") feed is an aggregation feed that contains articles from all SRF categories — including sport, culture, and knowledge. Since the base parser assigns `source: "srf"` to all SRF articles regardless of which feed they came from, the display-level filter cannot distinguish sport articles arriving via `srf-latest` from news articles. Users who disable sport feeds still see sport content and have no way to remove it.

## What Changes

- Add URL-based category filters to the SRF connector, using the existing `ArticleFilter` infrastructure (same pattern as Heise and Digitec/Galaxus filters)
- SRF article URLs encode their category in the path (e.g., `/sport/...`, `/kultur/...`, `/news/...`), allowing reliable content-based filtering
- Each SRF feed group (Sport, Kultur, Wissen) gets a corresponding `ArticleFilter` that matches articles by URL path prefix
- Users can toggle these filters independently of feed subscriptions, giving them control over cross-feed content from `srf-latest`

## Capabilities

### New Capabilities
- `srf-category-filters`: URL-based article filters for the SRF connector that match articles by category path prefix (`/sport/`, `/kultur/`, `/wissen/`), enabling users to hide entire content categories regardless of which SRF feed delivered them

### Modified Capabilities
- `connector-article-filters`: Add SRF-specific filter definitions following the existing `ArticleFilter` pattern
- `feed-configuration`: Settings UI automatically picks up new SRF filters via the existing filter rendering logic (no UI changes needed, but behavior verification required)

## Impact

- **Code**: `srf-connector.ts` (add `filters` array), `connector-filters.test.ts` (add SRF filter tests)
- **UX**: SRF section in settings will show a new "Filter" sub-section with toggles for Sport, Kultur, and Wissen categories
- **Data**: Filter preferences stored in `newsflash:filter-prefs` localStorage (local-only, not synced — consistent with existing filter behavior)
- **No breaking changes**: Existing feed preferences and article data are unaffected. Filters default to enabled (`enabledByDefault: true`), preserving current behavior until user explicitly disables a category.