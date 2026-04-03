## MODIFIED Requirements

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
- **THEN** the card SHALL remain visible and animated until the 350ms animation completes, after which the state mutation fires

#### Scenario: Button removal fires callback immediately
- **WHEN** the user clicks a removal button (hide, remove from read list)
- **THEN** the state mutation SHALL fire immediately without waiting for an animation
