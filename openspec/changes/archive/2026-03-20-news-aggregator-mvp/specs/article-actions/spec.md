## ADDED Requirements

### Requirement: Hide article via swipe right on mobile
On touch devices, swiping an article card to the right SHALL mark it as hidden.

#### Scenario: Swipe right hides article
- **WHEN** the user swipes an article card to the right on a touch device
- **THEN** the article SHALL be marked as hidden and removed from the feed (unless "Show hidden" is on)

#### Scenario: Swipe does not trigger navigation
- **WHEN** the user swipes an article card
- **THEN** the browser SHALL NOT navigate to the article's link

### Requirement: Hide article via hover button on desktop
On desktop, hovering over an article card SHALL reveal a hide button. Clicking it SHALL mark the article as hidden.

#### Scenario: Hover reveals hide button
- **WHEN** the user hovers over an article card on desktop
- **THEN** a hide button SHALL become visible

#### Scenario: Clicking hide button hides article
- **WHEN** the user clicks the hide button
- **THEN** the article SHALL be marked as hidden and the click SHALL NOT navigate to the article

### Requirement: Hide article via keyboard shortcut
Pressing `H` while an article is focused or hovered SHALL mark it as hidden.

#### Scenario: H key hides focused article
- **WHEN** the user presses `H` while an article card is focused or hovered
- **THEN** the article SHALL be marked as hidden

### Requirement: Save to Read List via swipe left on mobile
On touch devices, swiping an article card to the left SHALL add it to the Read List.

#### Scenario: Swipe left saves article
- **WHEN** the user swipes an article card to the left on a touch device
- **THEN** the article SHALL be added to the Read List

#### Scenario: Swipe does not trigger navigation
- **WHEN** the user swipes an article card to save it
- **THEN** the browser SHALL NOT navigate to the article's link

### Requirement: Save to Read List via hover button on desktop
On desktop, hovering over an article card SHALL reveal a save/bookmark button. Clicking it SHALL add the article to the Read List.

#### Scenario: Hover reveals save button
- **WHEN** the user hovers over an article card on desktop
- **THEN** a save/bookmark button SHALL become visible

#### Scenario: Clicking save button adds to Read List
- **WHEN** the user clicks the save button
- **THEN** the article SHALL be added to the Read List and the click SHALL NOT navigate to the article

### Requirement: Save to Read List via keyboard shortcut
Pressing `S` while an article is focused or hovered SHALL add it to the Read List.

#### Scenario: S key saves focused article
- **WHEN** the user presses `S` while an article card is focused or hovered
- **THEN** the article SHALL be added to the Read List

### Requirement: Read List view
The application SHALL provide a separate Read List view displaying all saved articles in the order they were saved (newest first).

#### Scenario: Read List shows saved articles
- **WHEN** the user navigates to the Read List view
- **THEN** all saved articles SHALL be displayed, newest-saved first

#### Scenario: Remove from Read List
- **WHEN** the user removes an article from the Read List
- **THEN** the article SHALL return to normal state in the main feed

### Requirement: Hidden articles are recoverable
Hidden articles SHALL be visible when the "Show hidden" filter is active. Users SHALL be able to unhide articles.

#### Scenario: Unhide an article
- **WHEN** the user unhides a previously hidden article (via button or gesture)
- **THEN** the article SHALL return to normal state and appear in the feed without the "Show hidden" filter

### Requirement: Article states persist in localStorage
Hidden article IDs and Read List article IDs SHALL be persisted in localStorage so they survive page refreshes.

#### Scenario: Hidden state persists
- **WHEN** the user hides an article and refreshes the page
- **THEN** the article SHALL still be hidden

#### Scenario: Read List persists
- **WHEN** the user saves an article and refreshes the page
- **THEN** the article SHALL still appear in the Read List
