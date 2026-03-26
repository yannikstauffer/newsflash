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
