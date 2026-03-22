## MODIFIED Requirements

### Requirement: Source-level toggle
Each source SHALL have a master toggle that enables or disables all of its sub-feeds at once, including feeds across all groups. The toggle SHALL use a Switch component instead of a checkbox. The Switch SHALL be ON when all feeds are enabled and OFF otherwise (no indeterminate state).

#### Scenario: Disable entire source
- **WHEN** the user toggles off a source (e.g., "SRF")
- **THEN** all sub-feeds under that source SHALL be disabled, across all groups

#### Scenario: Enable entire source
- **WHEN** the user toggles on a source
- **THEN** all sub-feeds under that source SHALL be enabled, across all groups

#### Scenario: Partial feeds enabled shows toggle OFF
- **WHEN** some feeds across different groups are enabled and others are disabled
- **THEN** the source-level Switch SHALL display as OFF (not indeterminate)

### Requirement: Feed configuration UI lists all pre-defined feeds
The feed configuration view SHALL display all feeds from the connector registry, grouped by source. Within each source, feeds with a `group` property SHALL be rendered in collapsible group sections. Feeds without a `group` property SHALL render flat as individual toggles. All toggles SHALL use Switch components positioned on the right side of each row.

#### Scenario: All feeds are listed
- **WHEN** the user opens feed configuration
- **THEN** all feeds from all connectors SHALL be listed, grouped by source name

#### Scenario: Grouped feeds render in collapsible sections
- **WHEN** a connector has feeds with `group` properties
- **THEN** feeds SHALL be clustered by group into collapsible sections within the connector's card

#### Scenario: Ungrouped feeds render flat
- **WHEN** a connector has feeds without `group` properties
- **THEN** those feeds SHALL render as individual Switch toggles directly under the connector header

#### Scenario: Source card display
- **WHEN** a source with sub-feeds is rendered
- **THEN** the source name and language badge SHALL appear on the left of the header row, with the Switch toggle on the right, and sub-feed toggles indented below
