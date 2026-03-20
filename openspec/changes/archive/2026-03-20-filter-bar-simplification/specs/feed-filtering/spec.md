## MODIFIED Requirements

### Requirement: Filter by language
The language filter SHALL be configured on the settings page and persisted in localStorage. The feed page SHALL read the persisted language preference and apply it. Options: "All", "DE", "EN". Default is "All".

#### Scenario: Filter to German only
- **WHEN** the user selects "DE" on the settings page
- **THEN** only articles with `language: "de"` SHALL be displayed on the feed page

#### Scenario: Filter to English only
- **WHEN** the user selects "EN" on the settings page
- **THEN** only articles with `language: "en"` SHALL be displayed on the feed page

#### Scenario: Show all languages
- **WHEN** the user selects "All" on the settings page
- **THEN** articles in both languages SHALL be displayed

#### Scenario: Language preference persists across sessions
- **WHEN** the user sets a language preference and refreshes the page
- **THEN** the language preference SHALL be restored from localStorage

## REMOVED Requirements

### Requirement: Filter by source
**Reason**: Source filtering on the feed page via pills has been removed. Source selection is managed exclusively on the settings page via feed configuration.
**Migration**: Use settings page checkboxes to enable/disable sources.
