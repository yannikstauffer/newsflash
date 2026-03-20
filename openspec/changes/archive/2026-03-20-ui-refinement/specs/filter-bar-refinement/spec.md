## ADDED Requirements

### Requirement: Two-row filter layout
The filter bar SHALL organize controls into two logical rows: source toggle buttons with refresh on the first row, and language filter, hidden toggle, and search input on the second row. On mobile, source buttons SHALL wrap naturally.

#### Scenario: Desktop view
- **WHEN** the filter bar is displayed on a screen wider than 768px
- **THEN** source buttons and refresh SHALL appear on the first row, and language/hidden/search SHALL appear on the second row with consistent spacing

#### Scenario: Mobile view
- **WHEN** the filter bar is displayed on a screen narrower than 768px
- **THEN** source buttons SHALL wrap to multiple lines, and the second row controls SHALL stack or adjust to fit the available width

### Requirement: Source buttons as compact pills
The source toggle buttons SHALL be styled as compact pill-shaped chips with reduced padding and smaller text to fit more sources without overflow.

#### Scenario: Source buttons rendering
- **WHEN** the filter bar renders source buttons
- **THEN** each button SHALL appear as a rounded pill with compact padding, filled when active and outlined when inactive

### Requirement: Search input with clear affordance
The search input SHALL include a visible search icon on the left and expand to fill available horizontal space in its row.

#### Scenario: Search input display
- **WHEN** the filter bar is rendered
- **THEN** the search input SHALL display with a search icon prefix and fill remaining space in the second row
