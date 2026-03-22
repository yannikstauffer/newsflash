## MODIFIED Requirements

### Requirement: Settings page structured layout
The settings page SHALL use a structured layout with clearly labeled sections, card-style grouping for sources, and visual dividers between sources. The layout SHALL include a page heading. The Appearance section SHALL display three theme options: Light, Dark, and System.

#### Scenario: Settings page rendering
- **WHEN** the user opens the settings page
- **THEN** the page SHALL display a "Settings" heading, a "Language" section with the segmented control, an "Appearance" section with Light / Dark / System options, and a "Sources" section with each source in a card-like group separated by dividers

#### Scenario: Appearance section displays three options
- **WHEN** the user views the Appearance section
- **THEN** a segmented control with "Light", "Dark", and "System" options SHALL be displayed

#### Scenario: System option is visually selected for new users
- **WHEN** a new user (no stored preference) opens the settings page
- **THEN** the "System" option SHALL be visually selected/active

#### Scenario: Source card display
- **WHEN** a source with sub-feeds is rendered
- **THEN** the source name and language badge SHALL appear as a header, with sub-feed checkboxes indented below, all within a visually grouped container
