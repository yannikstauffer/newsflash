## MODIFIED Requirements

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
