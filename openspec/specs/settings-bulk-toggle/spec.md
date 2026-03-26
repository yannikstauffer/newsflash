## ADDED Requirements

### Requirement: Enable All button
The Sources section header SHALL include an "Enable All" ghost button that enables all feeds across all connectors.

#### Scenario: Enable All activates all feeds
- **WHEN** the user clicks "Enable All"
- **THEN** all feeds across all connectors SHALL be set to enabled

#### Scenario: Enable All button rendering
- **WHEN** the Sources section is displayed
- **THEN** an "Enable All" ghost button SHALL appear right-aligned in the Sources section header row

### Requirement: Disable All button
The Sources section header SHALL include a "Disable All" ghost button that disables all feeds across all connectors and triggers localStorage cleanup.

#### Scenario: Disable All deactivates all feeds
- **WHEN** the user clicks "Disable All"
- **THEN** all feeds across all connectors SHALL be set to disabled

#### Scenario: Disable All triggers cleanup
- **WHEN** the user clicks "Disable All"
- **THEN** hidden article IDs and read list entries SHALL be cleaned up for all connectors (same cleanup as per-source disable)

#### Scenario: Disable All button rendering
- **WHEN** the Sources section is displayed
- **THEN** a "Disable All" ghost button SHALL appear right-aligned in the Sources section header row, next to "Enable All"

### Requirement: Bulk toggle i18n
Button labels "Enable All" and "Disable All" SHALL be translated (EN + DE).

#### Scenario: German translation
- **WHEN** the app locale is German
- **THEN** the buttons SHALL display "Alle aktivieren" and "Alle deaktivieren"
