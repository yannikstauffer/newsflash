## ADDED Requirements

### Requirement: Offline banner displays when network is unavailable

An offline banner component SHALL be displayed in the app layout when the browser detects that the network is unavailable. The banner SHALL be informational (not blocking) and positioned above the main content area.

#### Scenario: Going offline shows banner

- **WHEN** the browser fires the `offline` window event
- **THEN** a banner SHALL appear with text indicating the user is offline (e.g., "You're offline — showing cached content")

#### Scenario: Coming back online hides banner

- **WHEN** the browser fires the `online` window event after being offline
- **THEN** the offline banner SHALL disappear

#### Scenario: Already offline on mount

- **WHEN** the app mounts and `navigator.onLine` is `false`
- **THEN** the offline banner SHALL be visible immediately

### Requirement: Offline banner is accessible

The offline banner SHALL meet WCAG 2.1 Level AA requirements.

#### Scenario: Screen reader announces status

- **WHEN** the offline banner appears
- **THEN** it SHALL have `role="status"` so screen readers announce the change without interrupting the user

#### Scenario: Sufficient color contrast

- **WHEN** the offline banner is displayed
- **THEN** the text SHALL have a contrast ratio of at least 4.5:1 against the background
