## MODIFIED Requirements

### Requirement: Feed configuration UI lists all pre-defined feeds
The feed configuration view SHALL display all feeds from the connector registry, grouped by source. Within each source, feeds with a `group` property SHALL be rendered in collapsible group sections. Feeds without a `group` property SHALL render flat as individual checkboxes.

#### Scenario: All feeds are listed
- **WHEN** the user opens feed configuration
- **THEN** all feeds from all connectors SHALL be listed, grouped by source name

#### Scenario: Grouped feeds render in collapsible sections
- **WHEN** a connector has feeds with `group` properties
- **THEN** feeds SHALL be clustered by group into collapsible sections within the connector's card

#### Scenario: Ungrouped feeds render flat
- **WHEN** a connector has feeds without `group` properties
- **THEN** those feeds SHALL render as individual checkboxes directly under the connector header (existing behavior)

#### Scenario: Mixed grouped and ungrouped feeds
- **WHEN** a connector has both grouped and ungrouped feeds
- **THEN** ungrouped feeds SHALL render flat and grouped feeds SHALL render in their collapsible sections

### Requirement: Source-level toggle
Each source SHALL have a master toggle that enables or disables all of its sub-feeds at once, including feeds across all groups.

#### Scenario: Disable entire source
- **WHEN** the user toggles off a source (e.g., "SRF")
- **THEN** all sub-feeds under that source SHALL be disabled, across all groups

#### Scenario: Enable entire source
- **WHEN** the user toggles on a source
- **THEN** all sub-feeds under that source SHALL be enabled, across all groups

#### Scenario: Source checkbox indeterminate with groups
- **WHEN** some feeds across different groups are enabled and others are disabled
- **THEN** the source-level checkbox SHALL display in an indeterminate state
