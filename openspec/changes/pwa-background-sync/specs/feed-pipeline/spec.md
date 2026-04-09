## ADDED Requirements

### Requirement: Framework-agnostic feed pipeline

A standalone module (`src/lib/feed-pipeline.ts`) SHALL provide a function to fetch, parse, and normalize articles from all feeds. The module SHALL have zero React, DOM, or browser-specific dependencies (beyond `fetch`), enabling it to run in both the main thread and a service worker.

#### Scenario: Fetch and parse all feeds

- **WHEN** `fetchAndParseAllFeeds(feedIds)` is called with a list of feed identifiers
- **THEN** it SHALL fetch each feed via `/api/rss/<id>`, parse the XML using the appropriate connector, normalize the articles, and return a flat array of `NormalizedArticle`

#### Scenario: Individual feed failure does not block others

- **WHEN** one feed fails to fetch or parse
- **THEN** the pipeline SHALL log the error and continue processing remaining feeds
- **AND** the returned array SHALL contain articles from all successful feeds

#### Scenario: No React or DOM dependencies

- **WHEN** the module's import tree is analyzed
- **THEN** it SHALL not transitively import `react`, `react-dom`, or any module that accesses `document` or `window` (beyond standard `fetch` and `URL`)

## MODIFIED Requirements

### Requirement: Feed data hook uses the shared pipeline

The `use-feed-data` hook SHALL delegate feed fetching and parsing to `fetchAndParseAllFeeds` from the shared pipeline instead of implementing the logic inline.

#### Scenario: Refactored hook produces identical output

- **WHEN** the feed data hook fetches articles using the shared pipeline
- **THEN** the resulting articles SHALL be identical to the previous inline implementation (same normalization, deduplication, error handling)

#### Scenario: Hook still manages React state

- **WHEN** the shared pipeline returns articles
- **THEN** the hook SHALL continue to manage `loading`, `errors`, and `articles` state as before — only the fetch/parse step is delegated
