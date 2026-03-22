## Requirements

### Requirement: Swipe-triggered removal plays slide-away animation
When a swipe exceeds the action threshold, the card SHALL animate away in the swipe direction while fading out and collapsing.

#### Scenario: Swipe right removal animation
- **WHEN** the user releases a swipe to the right past the threshold
- **THEN** the card SHALL simultaneously slide to the right edge, fade to opacity 0, and collapse its height to 0 over 350ms

#### Scenario: Swipe left removal animation
- **WHEN** the user releases a swipe to the left past the threshold
- **THEN** the card SHALL simultaneously slide to the left edge, fade to opacity 0, and collapse its height to 0 over 350ms

### Requirement: Button-triggered removal plays fade-collapse animation
When a card is removed via button click (hide button, bookmark button, remove button), the card SHALL fade out and collapse without sliding.

#### Scenario: Hide button removal animation
- **WHEN** the user clicks the hide button on an article card
- **THEN** the card SHALL simultaneously fade to opacity 0 and collapse its height to 0 over 350ms, with no horizontal translation

#### Scenario: Bookmark button removal animation
- **WHEN** the user clicks the bookmark button to save an article to the read list
- **THEN** the card SHALL simultaneously fade to opacity 0 and collapse its height to 0 over 350ms, with no horizontal translation

#### Scenario: Read list remove button animation
- **WHEN** the user clicks the remove button on a read list article
- **THEN** the card SHALL simultaneously fade to opacity 0 and collapse its height to 0 over 350ms, with no horizontal translation

### Requirement: State mutation fires after animation completes
The actual state change (hide, add to read list, remove from read list) SHALL fire after the removal animation completes, not before.

#### Scenario: Card remains in DOM during animation
- **WHEN** a removal animation is playing
- **THEN** the card SHALL remain visible and animated until the 350ms animation completes, after which the state mutation fires

### Requirement: Remaining cards slide up after removal
After a card is removed, the cards below it SHALL slide upward smoothly to fill the gap.

#### Scenario: List reflows after card removal
- **WHEN** a card's removal animation completes and its height collapses to 0
- **THEN** the cards below SHALL transition upward smoothly to close the gap
