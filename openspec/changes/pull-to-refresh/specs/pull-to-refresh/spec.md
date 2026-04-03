## ADDED Requirements

### Requirement: Pull gesture triggers feed refresh
The system SHALL detect a vertical pull-down gesture on the feed list and trigger a data refresh when the pull distance exceeds the activation threshold (64px). The gesture SHALL only be recognized on touch devices (`pointer: coarse`).

#### Scenario: Successful pull-to-refresh
- **WHEN** the user is on a touch device AND the page is scrolled to the top AND the user pulls down on the feed list past 64px and releases
- **THEN** the system SHALL call the feed refresh function and fetch updated articles

#### Scenario: Pull below threshold cancels
- **WHEN** the user pulls down on the feed list less than 64px and releases
- **THEN** the system SHALL NOT trigger a refresh and SHALL animate the list back to its original position

#### Scenario: Gesture ignored on desktop
- **WHEN** the device has a fine pointer (mouse/trackpad)
- **THEN** the pull-to-refresh gesture SHALL NOT be active and no pull-related event listeners SHALL be attached

#### Scenario: Gesture ignored when not at scroll top
- **WHEN** the page is scrolled down (scrollY > 1px) AND the user performs a pull-down gesture
- **THEN** the system SHALL NOT intercept the gesture and normal scrolling SHALL occur

### Requirement: Spinner indicates refresh in progress
The system SHALL display a spinner indicator above the first article card during a pull-to-refresh interaction. The spinner SHALL use the existing `Loader2` icon.

#### Scenario: Spinner visible during pull
- **WHEN** the user begins pulling down on the feed list from the scroll top
- **THEN** a spinner SHALL appear above the first article card, and the list content SHALL translate down following the pull distance (capped at 80px)

#### Scenario: Spinner during active refresh
- **WHEN** the pull gesture is released past the threshold and a refresh is in progress
- **THEN** the spinner SHALL remain visible at a fixed position until the refresh completes

#### Scenario: Spinner dismissed after refresh
- **WHEN** the refresh completes (loading transitions from true to false)
- **THEN** the spinner SHALL animate out and the list SHALL return to its original position

### Requirement: Pull-to-refresh disabled during loading
The system SHALL NOT respond to pull-to-refresh gestures while the feed is in a loading state (initial load or an active refresh).

#### Scenario: Pull during initial load
- **WHEN** the feed is performing its initial data load (no articles displayed yet)
- **THEN** the pull-to-refresh gesture SHALL be disabled

#### Scenario: Pull during active refresh
- **WHEN** a refresh is already in progress
- **THEN** additional pull-to-refresh gestures SHALL be ignored

### Requirement: No conflict with horizontal card swipe
The pull-to-refresh gesture SHALL NOT interfere with the existing horizontal swipe actions on article cards (`SwipeableCard`).

#### Scenario: Horizontal swipe unaffected
- **WHEN** the user performs a horizontal swipe on an article card
- **THEN** the swipe-to-hide and swipe-to-bookmark actions SHALL work as before, with no vertical pull interference
