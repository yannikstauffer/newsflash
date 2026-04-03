## MODIFIED Requirements

### Requirement: Save to Read List via hover button on desktop
On desktop, hovering over an article card SHALL reveal a save/bookmark button. Clicking it SHALL add the article to the Read List and hide it from the main feed. The button click SHALL trigger a fade-only card removal animation (collapse with opacity fade, no horizontal translation) to provide visual feedback that the article has been saved and removed.

#### Scenario: Hover reveals save button
- **WHEN** the user hovers over an article card on desktop
- **THEN** a save/bookmark button SHALL become visible

#### Scenario: Clicking save button adds to Read List and hides
- **WHEN** the user clicks the save button
- **THEN** the article SHALL be added to the Read List, marked as hidden, and the click SHALL NOT navigate to the article

#### Scenario: Clicking save button plays fade-only removal animation
- **WHEN** the user clicks the save button on an article card
- **THEN** the card SHALL play a fade-only removal animation (opacity fade + height collapse, no horizontal slide) before disappearing from the list

### Requirement: Save to Read List via keyboard shortcut
Pressing `S` while an article is focused or hovered SHALL add it to the Read List and hide it from the main feed. The keyboard shortcut SHALL trigger a fade-only card removal animation (collapse with opacity fade, no horizontal translation) to provide visual feedback.

#### Scenario: S key saves and hides focused article
- **WHEN** the user presses `S` while an article card is focused or hovered
- **THEN** the article SHALL be added to the Read List AND marked as hidden

#### Scenario: S key plays fade-only removal animation
- **WHEN** the user presses `S` while an article card is focused or hovered
- **THEN** the card SHALL play a fade-only removal animation (opacity fade + height collapse, no horizontal slide) before disappearing from the list
