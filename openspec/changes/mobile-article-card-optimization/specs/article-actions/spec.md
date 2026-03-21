## MODIFIED Requirements

### Requirement: Action button visibility adapts to device and viewport
The hide and bookmark action buttons SHALL be hidden by default. On non-touch devices, they SHALL appear on card hover (`group-hover`) or keyboard focus (`group-focus-within`). On touch devices at the `md` breakpoint or above, they SHALL be persistently visible. On touch devices below the `md` breakpoint, they SHALL remain hidden (swipe gestures provide these actions).

#### Scenario: Touch device below md breakpoint
- **WHEN** the device has touch capability AND the viewport is below the `md` breakpoint
- **THEN** the action buttons SHALL NOT be displayed

#### Scenario: Touch device at md breakpoint or above
- **WHEN** the device has touch capability AND the viewport is at or above the `md` breakpoint
- **THEN** the action buttons SHALL be persistently visible

#### Scenario: Non-touch device hover
- **WHEN** the user hovers over an article card on a non-touch device
- **THEN** the action buttons SHALL become visible

#### Scenario: Keyboard focus within card
- **WHEN** keyboard focus is within an article card
- **THEN** the action buttons SHALL become visible
