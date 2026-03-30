## MODIFIED Requirements

### Requirement: Filter toggles in settings UI
The feed configuration page SHALL display a "Filters" sub-section under each connector that has filters defined. Each filter SHALL be rendered as a checkbox with the same styling and semantic as feed toggles: checked means content is shown, unchecked means content is hidden.

#### Scenario: Connector with filters shows filter section
- **WHEN** the user opens settings and a connector has filters defined
- **THEN** a filter section SHALL appear below the connector's feed list, with one checkbox per filter

#### Scenario: Connector without filters shows no filter section
- **WHEN** the user opens settings and a connector has no filters defined
- **THEN** no filter section SHALL be rendered for that connector

#### Scenario: SRF shows filter section with category filters
- **WHEN** the user opens settings
- **THEN** the SRF connector SHALL display a "Filter" section with toggles for Sport, Kultur, and Wissen

#### Scenario: Filter checkbox reflects current state
- **WHEN** a filter is enabled
- **THEN** its checkbox SHALL be checked

#### Scenario: Toggling filter updates preferences
- **WHEN** the user toggles a filter checkbox
- **THEN** the filter preference SHALL be updated in localStorage and the feed SHALL update accordingly
