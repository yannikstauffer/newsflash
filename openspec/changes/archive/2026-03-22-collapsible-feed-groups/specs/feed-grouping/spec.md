## ADDED Requirements

### Requirement: FeedConfig supports an optional group field
The `FeedConfig` interface SHALL include an optional `group` property of type `string`. When present, feeds with the same `group` value within a connector SHALL be rendered together in a collapsible section.

#### Scenario: Feed with group assigned
- **WHEN** a `FeedConfig` has `group: "Sport"`
- **THEN** it SHALL be grouped with other feeds that have `group: "Sport"` in the same connector

#### Scenario: Feed without group assigned
- **WHEN** a `FeedConfig` has no `group` property
- **THEN** it SHALL render in the flat list as it does today (ungrouped)

### Requirement: Collapsible group sections in settings UI
The settings page SHALL render grouped feeds within collapsible sections. Each group section SHALL display a header with the group name and SHALL be collapsed by default.

#### Scenario: Groups are collapsed by default
- **WHEN** the settings page loads
- **THEN** all feed groups SHALL be collapsed, showing only the group header

#### Scenario: Expanding a group
- **WHEN** the user clicks a collapsed group header
- **THEN** the group SHALL expand to show all feeds within it

#### Scenario: Collapsing a group
- **WHEN** the user clicks an expanded group header
- **THEN** the group SHALL collapse, hiding the individual feed checkboxes

### Requirement: Group summary count
Each group header SHALL display a summary count showing how many feeds in the group are enabled out of the total.

#### Scenario: All feeds enabled
- **WHEN** a group "Sport" has 8 feeds and all are enabled
- **THEN** the header SHALL display "8/8 on"

#### Scenario: Some feeds enabled
- **WHEN** a group "Sport" has 8 feeds and 3 are enabled
- **THEN** the header SHALL display "3/8 on"

#### Scenario: No feeds enabled
- **WHEN** a group "Sport" has 8 feeds and none are enabled
- **THEN** the header SHALL display "0/8 on"

### Requirement: Group-level toggle checkbox
Each group header SHALL include a checkbox that toggles all feeds in the group at once.

#### Scenario: Toggle all on
- **WHEN** the user checks the group checkbox while some or no feeds are enabled
- **THEN** all feeds in the group SHALL be enabled

#### Scenario: Toggle all off
- **WHEN** the user checks the group checkbox while all feeds are enabled
- **THEN** all feeds in the group SHALL be disabled

#### Scenario: Indeterminate state
- **WHEN** some (but not all) feeds in a group are enabled
- **THEN** the group checkbox SHALL display in an indeterminate state

### Requirement: Group header accessibility
Group headers SHALL be accessible via keyboard and screen readers.

#### Scenario: Keyboard expand/collapse
- **WHEN** a group header has focus and the user presses Enter or Space
- **THEN** the group SHALL toggle between expanded and collapsed

#### Scenario: ARIA attributes
- **WHEN** a group header is rendered
- **THEN** it SHALL have `aria-expanded` set to the current expand state and the group content SHALL have `role="group"` with `aria-labelledby` referencing the header

#### Scenario: Touch target size
- **WHEN** a group header is rendered on mobile
- **THEN** it SHALL have a minimum touch target of 44x44px
