## MODIFIED Requirements

### Requirement: Two-row filter layout
The filter bar SHALL organize controls into a single row: hidden toggle, search input, and refresh button. Source pills and language selector are removed.

#### Scenario: Filter bar rendering
- **WHEN** the filter bar is displayed
- **THEN** it SHALL show the "Show hidden" toggle, search input with search icon, and refresh button in a single row — no source pills, no language selector

#### Scenario: Mobile view
- **WHEN** the filter bar is displayed on a mobile viewport
- **THEN** the controls SHALL fit in a single row, with the search input filling remaining space

## REMOVED Requirements

### Requirement: Source buttons as compact pills
**Reason**: Source selection is managed exclusively on the settings page
**Migration**: Use settings page to enable/disable sources
