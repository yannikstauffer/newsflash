## Requirements

### Requirement: Asymmetric drag thresholds bias toward swipe detection
The swipe gesture detection SHALL use asymmetric drag thresholds (`[10, 30]`) instead of `axis: "x"`, so that horizontal movement registers at 10px but vertical scroll requires 30px. This biases gesture detection toward horizontal swipes, reducing accidental scroll rejection of diagonal swipes.

#### Scenario: Slight diagonal swipe registers as horizontal
- **WHEN** the user performs a swipe with slight vertical movement (less than 30px vertical before 10px horizontal)
- **THEN** the gesture SHALL be detected as a horizontal swipe, not rejected as a vertical scroll

#### Scenario: Intentional vertical scroll is not blocked
- **WHEN** the user scrolls vertically with movement exceeding 30px before 10px horizontal
- **THEN** native scroll SHALL take over via `touch-pan-y` CSS class on the inner element

### Requirement: Swipe action threshold
The SWIPE_THRESHOLD SHALL remain at 80px to trigger an action. The 10px drag threshold is for initial gesture detection only, not for action triggering.

#### Scenario: Swipe below action threshold
- **WHEN** the user swipes horizontally more than 10px but less than 80px and releases
- **THEN** the card SHALL snap back to its original position without triggering any action

#### Scenario: Swipe above action threshold
- **WHEN** the user swipes horizontally past 80px and releases
- **THEN** the swipe action SHALL be triggered (hide or save depending on direction)

### Requirement: Tap filtering
The drag configuration SHALL use `filterTaps: true` to distinguish taps from swipe gestures, preventing accidental action triggers on tap.

#### Scenario: Tap on card does not trigger swipe
- **WHEN** the user taps on an article card without dragging
- **THEN** no swipe gesture SHALL be detected and no swipe action SHALL be triggered
