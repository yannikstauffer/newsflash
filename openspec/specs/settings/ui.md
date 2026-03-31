# Settings Toggle Switches

## ADDED Requirements

### Requirement: Feed toggles use Switch components
All feed enable/disable controls SHALL use shadcn Switch components instead of native HTML checkboxes. This applies to connector-level toggles, group-level toggles, and individual feed toggles.

#### Scenario: Connector-level toggle renders as Switch
- **WHEN** the Sources section is displayed
- **THEN** each connector row SHALL render a Switch component instead of a checkbox

#### Scenario: Group-level toggle renders as Switch
- **WHEN** a feed group header is displayed within a connector
- **THEN** the group toggle SHALL render as a Switch component instead of a checkbox

#### Scenario: Individual feed toggle renders as Switch
- **WHEN** a feed group is expanded showing individual feeds
- **THEN** each feed SHALL render a Switch component instead of a checkbox

### Requirement: Switches are right-aligned
All Switch components in the Sources section SHALL be positioned on the right side of the row, with the label text on the left.

#### Scenario: Connector row layout
- **WHEN** a connector row is rendered
- **THEN** the connector name and language badge SHALL appear on the left and the Switch SHALL appear on the right, using `justify-between` alignment

#### Scenario: Individual feed row layout
- **WHEN** an individual feed row is rendered within an expanded group
- **THEN** the feed name SHALL appear on the left and the Switch SHALL appear on the right

### Requirement: Switch accessibility
Each Switch component SHALL have an accessible label associated with it, supporting keyboard navigation (Space to toggle) and screen reader announcement of state.

#### Scenario: Keyboard toggle
- **WHEN** a Switch is focused and the user presses Space
- **THEN** the Switch SHALL toggle its checked state

#### Scenario: Screen reader announcement
- **WHEN** a screen reader encounters a Switch
- **THEN** it SHALL announce the label text and current state (on/off) via `role="switch"` and `aria-checked`

---

# Settings Bulk Toggle

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

---

# Settings Card Layout

## ADDED Requirements

### Requirement: Settings sections wrapped in cards
Each settings section (Language, Appearance, Sources) SHALL be wrapped in a card container with a visible border and rounded corners (`rounded-lg border border-border p-6`).

#### Scenario: Card containers render around each section
- **WHEN** the settings page is displayed
- **THEN** Language, Appearance, and Sources sections SHALL each be enclosed in a bordered card container

### Requirement: Section description text
Each settings section SHALL display a muted description below the section heading, explaining the purpose of the section. Descriptions SHALL be translated (EN + DE).

#### Scenario: Language section description
- **WHEN** the Language section is displayed
- **THEN** the text "Choose the language for the interface and news feeds." (EN) or "Wahle die Sprache fur die Oberflache und News-Feeds." (DE) SHALL appear below the heading in muted style

#### Scenario: Appearance section description
- **WHEN** the Appearance section is displayed
- **THEN** the text "Select a theme for the app." (EN) or "Wahle ein Design fur die App." (DE) SHALL appear below the heading in muted style

#### Scenario: Sources section description
- **WHEN** the Sources section is displayed
- **THEN** the text "Enable or disable news sources to customize your feed." (EN) or "Aktiviere oder deaktiviere Nachrichtenquellen, um deinen Feed anzupassen." (DE) SHALL appear below the heading in muted style

### Requirement: Two-column grid on desktop
On `lg:` breakpoint and above, Language and Appearance cards SHALL render side-by-side in a two-column grid. Cards SHALL stretch to equal height. Sources SHALL render full-width below the grid.

#### Scenario: Desktop layout
- **WHEN** the viewport is `lg` (1024px) or wider
- **THEN** Language and Appearance cards SHALL display in a two-column grid row with equal height

#### Scenario: Mobile layout
- **WHEN** the viewport is below `lg` (< 1024px)
- **THEN** all cards SHALL stack vertically in a single column
