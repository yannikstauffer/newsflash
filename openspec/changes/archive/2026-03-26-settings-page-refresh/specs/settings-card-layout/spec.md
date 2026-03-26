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
- **THEN** the text "Choose the language for the interface and news feeds." (EN) or "Wähle die Sprache für die Oberfläche und News-Feeds." (DE) SHALL appear below the heading in muted style

#### Scenario: Appearance section description
- **WHEN** the Appearance section is displayed
- **THEN** the text "Select a theme for the app." (EN) or "Wähle ein Design für die App." (DE) SHALL appear below the heading in muted style

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
