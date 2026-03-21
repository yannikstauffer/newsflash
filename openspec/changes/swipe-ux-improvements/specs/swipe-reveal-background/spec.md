## ADDED Requirements

### Requirement: Swipe reveals colored background with action icon
When the user swipes an article card horizontally, a colored background with an action icon SHALL be revealed behind the card as it translates.

#### Scenario: Swipe right in main feed reveals amber background with eye-off icon
- **WHEN** the user swipes an article card to the right in the main feed
- **THEN** an amber background (amber-100, dark: amber-900/30) with an eye-off icon SHALL be visible behind the card

#### Scenario: Swipe left in main feed reveals blue background with bookmark icon
- **WHEN** the user swipes an article card to the left in the main feed
- **THEN** a blue background (blue-100, dark: blue-900/30) with a bookmark icon SHALL be visible behind the card

#### Scenario: Swipe right in read list reveals red background with x-circle icon
- **WHEN** the user swipes an article card to the right in the read list
- **THEN** a red background (red-100, dark: red-900/30) with an x-circle icon SHALL be visible behind the card

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
