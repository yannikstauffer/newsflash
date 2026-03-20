## MODIFIED Requirements

### Requirement: Simplified single-row filter bar
The filter bar SHALL contain the "All articles" toggle, "Show hidden" toggle, centered day navigation (prev/date/next), and search input. The refresh button SHALL NOT appear. Source pills and language selector SHALL NOT appear on the feed page.

#### Scenario: Filter bar rendering
- **WHEN** the filter bar is displayed
- **THEN** it SHALL show (left to right): "All articles" toggle, "Hidden" toggle, centered prev/date/next navigation, and search input — no refresh button, no source pills, no language selector

#### Scenario: Toggle ordering
- **WHEN** the filter bar is displayed
- **THEN** the "All articles" toggle SHALL appear to the left of the "Hidden" toggle

#### Scenario: Day navigation centering
- **WHEN** the filter bar is displayed and "All articles" is not active
- **THEN** the prev/date/next controls SHALL be visually centered within the bar

#### Scenario: Day navigation hidden when all articles active
- **WHEN** "All articles" toggle is active
- **THEN** the prev/date/next controls SHALL NOT be displayed

#### Scenario: Mobile view
- **WHEN** the filter bar is displayed on a mobile viewport
- **THEN** the controls SHALL wrap gracefully, with the search input filling remaining space on its row

## REMOVED Requirements

### Requirement: Refresh button in filter bar
**Reason**: Redundant — users can refresh via browser page reload
**Migration**: Remove `refreshButton` prop from FilterBar and `RefreshButton` usage in FeedPage
