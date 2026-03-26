## MODIFIED Requirements

### Requirement: Remove from Read List
Removing an article from the Read List SHALL remove it from the Read List view. The article SHALL remain hidden in the main feed. The button-triggered removal SHALL call `removeFromReadList` directly without routing through SwipeableCard's animation callback.

#### Scenario: Remove from Read List via button persists
- **WHEN** the user clicks the remove button on a read list article
- **THEN** the article SHALL be removed from localStorage and SHALL NOT reappear on page reload

#### Scenario: Remove from Read List keeps article hidden
- **WHEN** the user removes an article from the Read List (via button or swipe)
- **THEN** the article SHALL be removed from the Read List but SHALL remain hidden in the main feed

### Requirement: Save to Read List via swipe left on mobile
On touch devices, swiping an article card to the left SHALL add it to the Read List and hide it from the main feed. The swipe SHALL be integrated via `SwipeConfig` objects passed to `SwipeableCard`.

#### Scenario: Swipe left saves and hides article
- **WHEN** the user swipes an article card to the left on a touch device
- **THEN** the article SHALL be added to the Read List AND marked as hidden

#### Scenario: Swipe does not trigger navigation
- **WHEN** the user swipes an article card to save it
- **THEN** the browser SHALL NOT navigate to the article's link
