## ADDED Requirements

### Requirement: Filter by language (persisted in settings)
The language filter SHALL be configured on the settings page and persisted in localStorage. The feed page SHALL read the persisted language preference and apply it. Options: "All", "DE", "EN". Default is "All".

#### Scenario: Filter to German only
- **WHEN** the user selects "DE" on the settings page
- **THEN** only articles with `language: "de"` SHALL be displayed on the feed page

#### Scenario: Filter to English only
- **WHEN** the user selects "EN" on the settings page
- **THEN** only articles with `language: "en"` SHALL be displayed on the feed page

#### Scenario: Show all languages
- **WHEN** the user selects "All" on the settings page
- **THEN** articles in both languages SHALL be displayed

#### Scenario: Language preference persists across sessions
- **WHEN** the user sets a language preference and refreshes the page
- **THEN** the language preference SHALL be restored from localStorage

### Requirement: Show hidden toggle
The feed SHALL provide a "Show hidden" toggle on the feed page filter bar, off by default. When on, hidden articles appear in the feed with a visually distinct (dimmed) appearance.

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
All active filters (language, show hidden, search) SHALL be combined with AND logic.

#### Scenario: Multiple filters applied
- **WHEN** the user has "EN" language set AND types "apple" in search
- **THEN** only English articles matching "apple" SHALL be displayed

## REMOVED Requirements

### ~~Requirement: Filter by source on feed page~~
Source filtering on the feed page via pills has been removed. Source selection is managed exclusively on the settings page via feed configuration.
