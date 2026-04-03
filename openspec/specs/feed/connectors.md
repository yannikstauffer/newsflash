# Feed Connectors

## From: feed-connectors/spec.md

## MODIFIED Requirements

### Requirement: Connector interface defines a uniform contract for all feed sources
Each Connector SHALL expose an `id` (unique string), `name` (display name), `language` ("de" or "en"), `feeds` (array of feed configurations), a `parse(xml: string): NormalizedArticle[]` method, and an optional `filters` (readonly array of `ArticleFilter`).

#### Scenario: Connector provides metadata
- **WHEN** a connector is registered
- **THEN** it SHALL have a unique `id`, a human-readable `name`, a `language` of "de" or "en", and at least one feed in `feeds`

#### Scenario: Connector parses XML into normalized articles
- **WHEN** `parse()` is called with valid RSS or Atom XML
- **THEN** it SHALL return an array of `NormalizedArticle` objects with `id`, `title`, `description`, `link`, `publishedAt`, `source`, `language`, and optional `imageUrl` and `category`

#### Scenario: Connector optionally defines filters
- **WHEN** a connector is registered
- **THEN** it MAY have a `filters` property containing an array of `ArticleFilter` objects

## From: connector-folder-structure/spec.md

## ADDED Requirements

### Requirement: Connector implementations live in sources subdirectory
All connector implementation files SHALL reside in `src/features/connectors/sources/`. Generic connector infrastructure (`types.ts`, `base-parser.ts`, `registry.ts`, `fetch-feed.ts`) SHALL remain at `src/features/connectors/`.

#### Scenario: Source files in sources directory
- **WHEN** the project structure is inspected
- **THEN** all `*-connector.ts` files SHALL be located in `src/features/connectors/sources/`

#### Scenario: Generic files at connectors root
- **WHEN** the project structure is inspected
- **THEN** `types.ts`, `base-parser.ts`, `registry.ts`, and `fetch-feed.ts` SHALL be located at `src/features/connectors/`

### Requirement: Registry imports from sources subdirectory
The `registry.ts` file SHALL import all connector implementations from the `./sources/` path.

#### Scenario: Registry imports updated
- **WHEN** `registry.ts` is loaded
- **THEN** all connector imports SHALL use paths starting with `./sources/`

## From: connector-article-filters/spec.md

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

## From: e2e-test-maintenance/spec.md

## Requirements

### Requirement: Connector E2E tests use live RSS feeds
The `connectors.spec.ts` tests SHALL NOT mock RSS feed requests. Tests SHALL rely on the Vite dev server proxy to fetch real XML from upstream feed URLs. Image requests SHALL still be mocked with a placeholder PNG.

#### Scenario: Connector smoke test hits real feed
- **WHEN** a connector smoke test runs for a given connector
- **THEN** the app SHALL fetch real RSS/Atom XML via the Vite proxy at `/api/rss/<feed-id>` without `page.route()` interception for RSS endpoints

#### Scenario: Each connector renders articles with thumbnails
- **WHEN** the smoke test runs for a connector
- **THEN** at least one `<article>` element SHALL be visible on the page
- **AND** if the connector has `allHaveImages: true`, each article SHALL contain a loaded `<img>` element

#### Scenario: Connectors without guaranteed images skip image assertion
- **WHEN** the smoke test runs for a connector with `allHaveImages: false` (e.g., ubergizmo)
- **THEN** the test SHALL only assert that articles render, not that all have images

### Requirement: feed.spec.ts is deleted
The `feed.spec.ts` file SHALL be removed. Its smoke test role (article card rendering, image loading) is covered by the live connector smoke tests.

#### Scenario: No feed.spec.ts in test suite
- **WHEN** the E2E suite is listed
- **THEN** `feed.spec.ts` SHALL NOT exist in `tests-e2e/`

### Requirement: E2E tests are enabled in release CI workflow
The release workflow SHALL run Playwright E2E tests as a quality gate before publishing release artifacts.

#### Scenario: Release workflow runs E2E tests
- **WHEN** a release is triggered via `release.yml`
- **THEN** the workflow SHALL install Playwright browsers and run `npm run test:e2e`

#### Scenario: Playwright report is attached to release
- **WHEN** E2E tests complete in the release workflow
- **THEN** `playwright-report.zip` SHALL be uploaded as a release asset

### Requirement: Scheduled workflow runs live connector tests weekly
A GitHub Actions workflow `e2e-live.yml` SHALL run `connectors.spec.ts` on a weekly schedule and on manual dispatch.

#### Scenario: Weekly scheduled run
- **WHEN** Thursday 04:00 UTC arrives
- **THEN** the `e2e-live.yml` workflow SHALL trigger and run `npx playwright test --project=chromium tests-e2e/connectors.spec.ts`

#### Scenario: Manual trigger
- **WHEN** a developer triggers `e2e-live.yml` via `workflow_dispatch` in GitHub UI
- **THEN** the workflow SHALL run the same live connector tests

#### Scenario: Workflow failure is visible via badge
- **WHEN** `e2e-live.yml` fails
- **THEN** the README badge SHALL show a failing (red) status

### Requirement: README displays live feed test badge
The `README.md` SHALL include a GitHub Actions status badge for the `e2e-live.yml` workflow.

#### Scenario: Badge URL is correct
- **WHEN** viewing `README.md`
- **THEN** it SHALL contain a badge image pointing to `https://github.com/yannikstauffer/newsflash/actions/workflows/e2e-live.yml/badge.svg`

### Requirement: E2E suite is reduced to ~20 tests
The E2E suite SHALL be trimmed to remove tests that duplicate unit-tested logic. Only integration paths that cannot be validated by unit tests alone SHALL remain.

#### Scenario: connectors.spec.ts has 7 parameterized smoke tests
- **WHEN** the test suite is listed
- **THEN** `connectors.spec.ts` SHALL contain exactly 7 tests (one per connector), running on Desktop Chrome only

#### Scenario: filter.spec.ts is consolidated to 2 tests
- **WHEN** the test suite is listed
- **THEN** `filter.spec.ts` SHALL contain 1 search flow test and 1 day navigation test, running on Desktop Chrome only

#### Scenario: article-actions.spec.ts is consolidated to 5 tests
- **WHEN** the test suite is listed
- **THEN** `article-actions.spec.ts` SHALL contain 3 desktop tests (hide+unhide flow, save+remove flow, empty read list) and 2 mobile swipe tests

#### Scenario: navigation.spec.ts is consolidated to 1 test
- **WHEN** the test suite is listed
- **THEN** `navigation.spec.ts` SHALL contain 1 test covering the full tab cycle (Feed -> Read List -> Settings -> Feed)

#### Scenario: settings.spec.ts is consolidated to 4 tests
- **WHEN** the test suite is listed
- **THEN** `settings.spec.ts` SHALL contain 4 tests (language switch, language persistence, theme toggle, source disable/re-enable), running on Desktop Chrome only

### Requirement: Mobile Chrome project runs only for swipe tests
The Playwright mobile-chrome project SHALL be scoped to only run tests in `article-actions.spec.ts` that require touch/swipe interaction.

#### Scenario: Mobile project does not run non-swipe tests
- **WHEN** the Playwright suite runs
- **THEN** the mobile-chrome project SHALL only execute swipe gesture tests, not navigation, filter, settings, or connector tests

### Requirement: Connector E2E tests also run in regular CI
The `connectors.spec.ts` live tests SHALL run as part of the regular CI workflow (`ci.yml`) on push/PR, in addition to the weekly scheduled workflow.

#### Scenario: CI runs live connector tests
- **WHEN** a push or PR triggers `ci.yml`
- **THEN** `connectors.spec.ts` SHALL be included in the Playwright test run
