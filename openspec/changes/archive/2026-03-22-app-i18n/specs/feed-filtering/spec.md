## REMOVED Requirements

### ~~Requirement: Filter by language (persisted in settings)~~
Language filtering has been removed from the feed filtering pipeline. The language setting now controls the app locale instead of filtering articles. All articles are shown regardless of their source language.

## MODIFIED Requirements

### Requirement: Filters combine with AND logic
All active filters (~~language,~~ show hidden, search) SHALL be combined with AND logic.

#### Scenario: Multiple filters applied
- **WHEN** the user has "show hidden" on AND types "apple" in search
- **THEN** only articles matching "apple" (including hidden ones) SHALL be displayed
