## MODIFIED Requirements

### Requirement: Filters combine with AND logic
All active filters (show hidden, search, connector article filters) SHALL be combined with AND logic.

#### Scenario: Multiple filters applied
- **WHEN** the user has "show hidden" on AND types "apple" in search
- **THEN** only articles matching "apple" (including hidden ones) SHALL be displayed

#### Scenario: Connector filter combined with search
- **WHEN** a connector filter is disabled (excluding matching articles) AND the user searches
- **THEN** articles matching the disabled filter SHALL be excluded regardless of search match
