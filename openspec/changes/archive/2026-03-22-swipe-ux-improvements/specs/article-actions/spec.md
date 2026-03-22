## MODIFIED Requirements

### Requirement: Save to Read List via swipe left on mobile
On touch devices, swiping an article card to the left SHALL add it to the Read List and hide it from the main feed.

#### Scenario: Swipe left saves and hides article
- **WHEN** the user swipes an article card to the left on a touch device
- **THEN** the article SHALL be added to the Read List AND marked as hidden

#### Scenario: Swipe does not trigger navigation
- **WHEN** the user swipes an article card to save it
- **THEN** the browser SHALL NOT navigate to the article's link

### Requirement: Save to Read List via hover button on desktop
On desktop, hovering over an article card SHALL reveal a save/bookmark button. Clicking it SHALL add the article to the Read List and hide it from the main feed.

#### Scenario: Hover reveals save button
- **WHEN** the user hovers over an article card on desktop
- **THEN** a save/bookmark button SHALL become visible

#### Scenario: Clicking save button adds to Read List and hides
- **WHEN** the user clicks the save button
- **THEN** the article SHALL be added to the Read List, marked as hidden, and the click SHALL NOT navigate to the article

### Requirement: Save to Read List via keyboard shortcut
Pressing `S` while an article is focused or hovered SHALL add it to the Read List and hide it from the main feed.

#### Scenario: S key saves and hides focused article
- **WHEN** the user presses `S` while an article card is focused or hovered
- **THEN** the article SHALL be added to the Read List AND marked as hidden

### Requirement: Remove from Read List
Removing an article from the Read List SHALL remove it from the Read List view. The article SHALL remain hidden in the main feed.

#### Scenario: Remove from Read List keeps article hidden
- **WHEN** the user removes an article from the Read List (via button or swipe)
- **THEN** the article SHALL be removed from the Read List but SHALL remain hidden in the main feed

## ADDED Requirements

### Requirement: Swipe right to remove from Read List
On the Read List page, swiping an article card to the right SHALL remove it from the Read List.

#### Scenario: Swipe right removes from Read List
- **WHEN** the user swipes an article card to the right on the Read List page
- **THEN** the article SHALL be removed from the Read List

#### Scenario: Article stays hidden after removal from Read List
- **WHEN** an article is removed from the Read List via swipe
- **THEN** the article SHALL remain hidden in the main feed

### Requirement: Swipe left disabled on Read List page
On the Read List page, swiping left SHALL have no effect.

#### Scenario: Swipe left does nothing on Read List
- **WHEN** the user swipes an article card to the left on the Read List page
- **THEN** no action SHALL be triggered
