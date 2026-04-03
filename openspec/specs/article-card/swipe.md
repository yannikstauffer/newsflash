# Article Card Swipe

## From: swipe-gesture-detection/spec.md

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

## From: swipe-reveal-background/spec.md

## Requirements

### Requirement: Swipe reveals colored background with action icon
When the user swipes an article card horizontally, a colored background with an action icon SHALL be revealed behind the card as it translates. The feed SHALL pass full `SwipeConfig` objects (with `bgClassName`, `icon`, and `onAction`) to `SwipeableCard`.

#### Scenario: Swipe right in main feed reveals amber background with eye-off icon
- **WHEN** the user swipes an article card to the right in the main feed
- **THEN** an amber background (`bg-amber-100 dark:bg-amber-900/30`) with an `EyeOff` icon SHALL be visible behind the card

#### Scenario: Swipe left in main feed reveals blue background with bookmark icon
- **WHEN** the user swipes an article card to the left in the main feed
- **THEN** a blue background (`bg-blue-100 dark:bg-blue-900/30`) with a `BookmarkPlus` icon SHALL be visible behind the card

#### Scenario: Swipe right in read list reveals red background with x-circle icon
- **WHEN** the user swipes an article card to the right in the read list
- **THEN** a red background (`bg-red-100 dark:bg-red-900/30`) with an `XCircle` icon SHALL be visible behind the card

### Requirement: Background icon is vertically centered and fixed
The action icon in the revealed background SHALL be vertically centered and remain in a fixed position as the card slides.

#### Scenario: Icon position during swipe
- **WHEN** the user is mid-swipe on an article card
- **THEN** the action icon SHALL be vertically centered in the revealed area and SHALL NOT move with the card

### Requirement: Background is only visible during active swipe
The colored background SHALL only be visible while the card is displaced from its resting position.

#### Scenario: No background visible at rest
- **WHEN** the card is in its resting position (no swipe active)
- **THEN** no colored background SHALL be visible

#### Scenario: Background hidden after snap-back
- **WHEN** the user releases a swipe below the action threshold
- **THEN** the card SHALL snap back and the background SHALL be hidden once the card returns to rest

## From: card-removal-animation/spec.md

## Requirements

### Requirement: Swipe-triggered removal plays slide-away animation
When a swipe exceeds the action threshold, the card SHALL animate away in the swipe direction while fading out uniformly over 200ms. The gap collapse SHALL start 100ms after the card removal begins (staggered), using `cubic-bezier(0.2, 0, 0, 1)` easing for a fast start that eases in at the end. Total perceived duration is ~300ms from swipe release to gap closed.

#### Scenario: Swipe right removal animation
- **WHEN** the user releases a swipe to the right past the threshold
- **THEN** the card SHALL slide to the right edge and fade uniformly to opacity 0 over 200ms with ease-out easing
- **AND** 100ms after slide begins, the outer container SHALL collapse from full height to 0 over 200ms with `cubic-bezier(0.2, 0, 0, 1)` easing

#### Scenario: Swipe left removal animation
- **WHEN** the user releases a swipe to the left past the threshold
- **THEN** the card SHALL slide to the left edge and fade uniformly to opacity 0 over 200ms with ease-out easing
- **AND** 100ms after slide begins, the outer container SHALL collapse from full height to 0 over 200ms with `cubic-bezier(0.2, 0, 0, 1)` easing

### Requirement: Button-triggered removal plays fade-collapse animation
When a card is removed via button click (hide button, bookmark button, remove button), the card SHALL be removed immediately via React re-render. The removal animation is reserved for swipe gestures only.

#### Scenario: Hide button removal in feed
- **WHEN** the user clicks the hide button on an article card in the main feed
- **THEN** the article SHALL be hidden immediately via state mutation and removed from the visible list by React re-render

#### Scenario: Read list remove button
- **WHEN** the user clicks the remove button on a read list article
- **THEN** the article SHALL be removed from the read list immediately via state mutation and removed from the visible list by React re-render

### Requirement: State mutation fires after animation completes
The actual state change (hide, add to read list, remove from read list) SHALL fire after the swipe removal animation completes, not before. For button-triggered removals, the state mutation fires immediately.

#### Scenario: Swipe removal fires callback after animation
- **WHEN** a swipe removal animation is playing
- **THEN** the card SHALL remain visible and animated until the removal animation completes (~300ms total), after which the state mutation fires via `transitionend` on the outer container (with a 350ms fallback timeout)

#### Scenario: Button removal fires callback immediately
- **WHEN** the user clicks a removal button (hide, remove from read list)
- **THEN** the state mutation SHALL fire immediately without waiting for an animation

### Requirement: Remaining cards slide up after removal
After a card is removed, the cards below it SHALL slide upward smoothly to fill the gap.

#### Scenario: List reflows after card removal
- **WHEN** a card's removal animation completes and its height collapses to 0
- **THEN** the cards below SHALL transition upward smoothly to close the gap
