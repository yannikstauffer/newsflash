## ADDED Requirements

### Requirement: URL-based duplicate detection
The deduplication logic SHALL treat two articles as duplicates if they share the same `link` value (raw string comparison, no normalization). This check SHALL be OR'd with the existing title+date check — either condition is sufficient to filter an article as a duplicate.

#### Scenario: Articles with same URL but different titles are deduplicated
- **WHEN** two articles from different feeds have the same `link` but different titles
- **THEN** only one article SHALL appear in the feed

#### Scenario: Articles with same URL but different timestamps are deduplicated
- **WHEN** two articles have the same `link` but different `publishedAt` timestamps
- **THEN** only one article SHALL appear in the feed and it SHALL be the one with the most recent timestamp

#### Scenario: Articles with different URLs and same title+date are still deduplicated
- **WHEN** two articles have the same title and publishedAt but different URLs
- **THEN** only one article SHALL appear in the feed (existing behavior preserved)

#### Scenario: Articles with different URLs and different title+date are kept
- **WHEN** two articles have different `link` values and different title+date combinations
- **THEN** both articles SHALL appear in the feed

### Requirement: Youngest article wins on duplicate detection
When duplicates are detected (by either title+date or URL), the article with the most recent `publishedAt` timestamp SHALL be the one retained.

#### Scenario: Newer article is kept over older duplicate
- **WHEN** an article published at 11:00 and an article published at 10:00 share the same URL
- **THEN** the 11:00 article SHALL be retained and the 10:00 article SHALL be filtered out

#### Scenario: Identical timestamps retain first encountered
- **WHEN** two duplicate articles have the exact same `publishedAt` timestamp
- **THEN** one SHALL be retained (deterministic but order is implementation-defined)
