## ADDED Requirements

### Requirement: Feed configuration UI lists all pre-defined feeds
The feed configuration view SHALL display all feeds from the connector registry, grouped by source, with a toggle for each feed.

#### Scenario: All feeds are listed
- **WHEN** the user opens feed configuration
- **THEN** all feeds from all connectors SHALL be listed, grouped by source name

#### Scenario: SRF sub-feeds are individually toggleable
- **WHEN** the user views the SRF source in feed configuration
- **THEN** each SRF sub-feed (e.g., "Latest", "Switzerland", "Football") SHALL have its own toggle

### Requirement: Feeds default to enabled
All feeds SHALL be enabled by default when the user first loads the application (no prior preferences in localStorage).

#### Scenario: First load enables all feeds
- **WHEN** the user opens the app for the first time (no localStorage data)
- **THEN** all feeds SHALL be enabled

### Requirement: Feed preferences persist in localStorage
Enabled/disabled state for each feed SHALL be stored in localStorage and restored on page load.

#### Scenario: Disabled feed stays disabled after refresh
- **WHEN** the user disables a feed and refreshes the page
- **THEN** the feed SHALL remain disabled

#### Scenario: Preferences survive across sessions
- **WHEN** the user closes and reopens the browser
- **THEN** feed preferences SHALL be restored from localStorage

### Requirement: Source-level toggle
Each source SHALL have a master toggle that enables or disables all of its sub-feeds at once.

#### Scenario: Disable entire source
- **WHEN** the user toggles off a source (e.g., "SRF")
- **THEN** all sub-feeds under that source SHALL be disabled

#### Scenario: Enable entire source
- **WHEN** the user toggles on a source
- **THEN** all sub-feeds under that source SHALL be enabled
