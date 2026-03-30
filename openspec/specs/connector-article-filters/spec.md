## ADDED Requirements

### Requirement: ArticleFilter interface defines connector-level filters
Each `ArticleFilter` SHALL have an `id` (unique string), `label` (display string in source language), `enabledByDefault` (boolean), and a `match(article: NormalizedArticle) => boolean` function. When a filter is enabled (checked in settings), matching articles SHALL be shown. When disabled (unchecked), matching articles SHALL be excluded.

#### Scenario: Filter with enabledByDefault true
- **WHEN** a filter has `enabledByDefault: true` and no user preference is stored
- **THEN** the filter SHALL be enabled (articles shown)

#### Scenario: Filter with enabledByDefault false
- **WHEN** a filter has `enabledByDefault: false` and no user preference is stored
- **THEN** the filter SHALL be disabled (matching articles excluded)

#### Scenario: User overrides default
- **WHEN** a user explicitly toggles a filter
- **THEN** the user's preference SHALL override `enabledByDefault`

#### Scenario: SRF connector defines URL-based category filters
- **WHEN** the SRF connector is loaded
- **THEN** it SHALL include a `filters` array with three category filters matching articles by URL path

### Requirement: Heise connector defines two filters
The heise connector SHALL define two filters: `heise-plus` (label: "heise+ (Bezahlinhalte)", `enabledByDefault: false`) matching articles whose title starts with "heise+ |", and `heise-angebot` (label: "heise-Angebot (Werbung)", `enabledByDefault: true`) matching articles whose title starts with "heise-Angebot:".

#### Scenario: heise+ article matched
- **WHEN** an article has title "heise+ | Some paid article title"
- **THEN** the `heise-plus` filter's `match` function SHALL return `true`

#### Scenario: heise+ filter excludes by default
- **WHEN** no user preference is stored for `heise-plus`
- **THEN** articles matching the heise+ pattern SHALL be excluded from the feed

#### Scenario: heise-Angebot article matched
- **WHEN** an article has title "heise-Angebot: Workshop XYZ"
- **THEN** the `heise-angebot` filter's `match` function SHALL return `true`

#### Scenario: heise-Angebot shown by default
- **WHEN** no user preference is stored for `heise-angebot`
- **THEN** articles matching the heise-Angebot pattern SHALL be shown in the feed

#### Scenario: Regular heise article not matched
- **WHEN** an article has title "Windows: Update außer der Reihe"
- **THEN** neither filter's `match` function SHALL return `true`

### Requirement: Digitec connector defines category filters
The digitec connector SHALL define 7 filters based on the `category` field, all with `enabledByDefault: true`: Produkttest, Hintergrund, Kritik, Meinung, Neu im Sortiment, Ratgeber, Hinter den Kulissen. Each filter's `match` function SHALL return `true` when `article.category` equals the corresponding category string.

#### Scenario: Produkttest category matched
- **WHEN** an article has `category: "Produkttest"`
- **THEN** the `digitec-produkttest` filter's `match` function SHALL return `true`

#### Scenario: All digitec category filters enabled by default
- **WHEN** no user preferences are stored
- **THEN** all 7 digitec category filters SHALL be enabled (articles shown)

#### Scenario: User disables a category
- **WHEN** the user disables the `digitec-meinung` filter
- **THEN** articles with `category: "Meinung"` from digitec SHALL be excluded

### Requirement: Galaxus connector defines category filters
The galaxus connector SHALL define the same 7 category-based filters as digitec, with `galaxus-` prefixed IDs, all with `enabledByDefault: true`.

#### Scenario: Galaxus filters mirror digitec categories
- **WHEN** the galaxus connector is loaded
- **THEN** it SHALL have 7 filters with IDs prefixed `galaxus-` matching the same categories as digitec

### Requirement: WinFuture connector defines a downloads filter
The winfuture connector SHALL define one filter: `winfuture-downloads` (label: "Downloads", `enabledByDefault: true`) matching articles whose `link` contains "downloadvorschalt" or "/download/".

#### Scenario: Download article matched by downloadvorschalt URL
- **WHEN** an article has link "https://winfuture.de/downloadvorschalt,4010.html"
- **THEN** the `winfuture-downloads` filter's `match` function SHALL return `true`

#### Scenario: Download article matched by download product URL
- **WHEN** an article has link "https://winfuture.de/download/product/4200/"
- **THEN** the `winfuture-downloads` filter's `match` function SHALL return `true`

#### Scenario: Regular winfuture article not matched
- **WHEN** an article has link "https://winfuture.de/news,12345.html"
- **THEN** the `winfuture-downloads` filter's `match` function SHALL return `false`

### Requirement: Connectors without filters have no filters property
Engadget and Ubergizmo connectors SHALL NOT define any filters. Their `filters` property SHALL be `undefined` or omitted.

### Requirement: Filter preferences persist in localStorage
Filter enabled/disabled state SHALL be stored in localStorage under key `"newsflash:filter-prefs"` and restored on page load. For filters with `enabledByDefault: true`, absence from the store SHALL mean enabled (`store[filterId] !== false`). For filters with `enabledByDefault: false`, absence SHALL mean disabled (`store[filterId] === true` to be enabled).

#### Scenario: First load applies defaults
- **WHEN** no filter preferences exist in localStorage
- **THEN** each filter SHALL use its `enabledByDefault` value

#### Scenario: Toggle filter persists
- **WHEN** the user toggles a filter and refreshes the page
- **THEN** the filter's state SHALL be restored from localStorage

#### Scenario: Filter preference key
- **WHEN** filter preferences are stored
- **THEN** they SHALL be under the localStorage key `"newsflash:filter-prefs"`

### Requirement: Filter pipeline integration
The `filterArticles()` function SHALL check connector-level filters for each article. For each article, it SHALL look up the connector by `article.source`, iterate the connector's filters, and exclude the article if any active (enabled) filter's `match` function returns `true` and that filter is disabled in preferences.

#### Scenario: Disabled filter excludes matching articles
- **WHEN** a filter is disabled and an article matches the filter
- **THEN** the article SHALL be excluded from the result

#### Scenario: Enabled filter shows matching articles
- **WHEN** a filter is enabled and an article matches the filter
- **THEN** the article SHALL be included in the result (subject to other filters)

#### Scenario: Article with no matching filters passes through
- **WHEN** an article does not match any of its connector's filters
- **THEN** the article SHALL pass through regardless of filter preferences

#### Scenario: Connector with no filters
- **WHEN** an article belongs to a connector with no filters defined
- **THEN** the article SHALL pass through the filter check unchanged
