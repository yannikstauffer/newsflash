## ADDED Requirements

### Requirement: Filter by source
The feed SHALL provide toggles to show/hide articles from each source. All sources are shown by default.

#### Scenario: Disable a source filter
- **WHEN** the user deselects a source in the filter
- **THEN** articles from that source SHALL be hidden from the feed

#### Scenario: Re-enable a source filter
- **WHEN** the user re-selects a previously deselected source
- **THEN** articles from that source SHALL reappear in the feed

### Requirement: Filter by language
The feed SHALL provide language filter options: "All", "DE", "EN". Default is "All".

#### Scenario: Filter to German only
- **WHEN** the user selects "DE" language filter
- **THEN** only articles with `language: "de"` SHALL be displayed

#### Scenario: Filter to English only
- **WHEN** the user selects "EN" language filter
- **THEN** only articles with `language: "en"` SHALL be displayed

#### Scenario: Show all languages
- **WHEN** the user selects "All" language filter
- **THEN** articles in both languages SHALL be displayed

### Requirement: Show hidden toggle
The feed SHALL provide a "Show hidden" toggle, off by default. When on, hidden articles appear in the feed with a visually distinct (dimmed) appearance.

#### Scenario: Show hidden is off
- **WHEN** "Show hidden" is toggled off
- **THEN** hidden articles SHALL NOT appear in the feed

#### Scenario: Show hidden is on
- **WHEN** "Show hidden" is toggled on
- **THEN** hidden articles SHALL appear in the feed with a dimmed/distinguished visual style

### Requirement: Text search
The feed SHALL provide a search input that filters articles by matching the query against title and description (case-insensitive).

#### Scenario: Search matches title
- **WHEN** the user types a search query
- **THEN** only articles whose title contains the query (case-insensitive) SHALL be displayed

#### Scenario: Search matches description
- **WHEN** the user types a search query
- **THEN** articles whose description contains the query (case-insensitive) SHALL also be displayed

#### Scenario: Empty search shows all
- **WHEN** the search input is empty
- **THEN** all articles (subject to other active filters) SHALL be displayed

### Requirement: Filters combine with AND logic
All active filters (source, language, show hidden, search) SHALL be combined with AND logic.

#### Scenario: Multiple filters applied
- **WHEN** the user selects "EN" language AND deselects "srf" source AND types "apple" in search
- **THEN** only English articles from sources other than SRF matching "apple" SHALL be displayed
