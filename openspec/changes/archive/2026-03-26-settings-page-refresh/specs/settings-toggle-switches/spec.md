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
