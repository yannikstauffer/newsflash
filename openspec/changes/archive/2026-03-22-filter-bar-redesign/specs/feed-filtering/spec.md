## ADDED Requirements

### Requirement: Article count display
The filter bar SHALL display the count of non-hidden articles that match the current filters. When the "show hidden" toggle is active and hidden articles exist, the count SHALL be annotated with the hidden count.

#### Scenario: Count shows non-hidden articles
- **WHEN** the feed displays filtered articles with "show hidden" off
- **THEN** the filter bar SHALL show "{count} articles" (e.g., "14 articles")

#### Scenario: Count annotated when show hidden is active
- **WHEN** the "show hidden" toggle is active and there are hidden articles matching filters
- **THEN** the filter bar SHALL show "{visible} + {hidden} hidden" (e.g., "14 + 3 hidden")

#### Scenario: Count updates when filters change
- **WHEN** the user changes any filter (search, date, all articles, show hidden)
- **THEN** the article count SHALL update to reflect the new filtered result

#### Scenario: Zero articles
- **WHEN** no articles match the current filters
- **THEN** the count SHALL display "0 articles"
