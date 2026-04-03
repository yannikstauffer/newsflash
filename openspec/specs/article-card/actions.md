# Article Card Actions

## From: article-actions/spec.md

## ADDED Requirements

### Requirement: Article IDs include source prefix
Article IDs SHALL be formatted as `${sourceId}:${hash}` where `sourceId` is the feed source identifier and `hash` is the hash of the article link. This format ensures source-based filtering operations can identify which source an article belongs to.

#### Scenario: Generated article ID contains source prefix
- **WHEN** an article is parsed from a feed with source identifier "techcrunch"
- **THEN** the article ID SHALL start with "techcrunch:" followed by the hash value

#### Scenario: removeHiddenBySource matches prefixed IDs
- **WHEN** `removeHiddenBySource("techcrunch")` is called
- **THEN** all hidden IDs starting with "techcrunch:" SHALL be removed from the hidden list

### Requirement: Hash function uses 53-bit output
The hash function used for article ID generation SHALL produce values using up to 53 bits (the safe integer range in JavaScript) to minimize collision probability across tens of thousands of articles.

#### Scenario: Different article links produce distinct hashes
- **WHEN** two distinct article link URLs are hashed
- **THEN** the hash values SHALL differ (collision probability SHALL be less than 1 in 1 billion for up to 10,000 articles)

#### Scenario: Same article link produces consistent hash
- **WHEN** the same article link URL is hashed multiple times
- **THEN** the hash value SHALL be identical each time

### Requirement: Set-based O(1) lookups for article state
The `isHidden` and `isInReadList` functions SHALL use Set-based data structures for O(1) membership checks instead of linear array scans.

#### Scenario: isHidden performs constant-time lookup
- **WHEN** `isHidden` is called with an article ID and there are 500 hidden IDs
- **THEN** the lookup SHALL complete in O(1) time using a Set

#### Scenario: isInReadList performs constant-time lookup
- **WHEN** `isInReadList` is called with an article ID and there are 200 read list items
- **THEN** the lookup SHALL complete in O(1) time using a Set

### Requirement: Legacy localStorage data migration
On first load, the application SHALL detect and clear legacy article IDs that do not contain the source prefix separator (colon character).

#### Scenario: Legacy hidden IDs without prefix are cleared
- **WHEN** the application loads and `newsflash:hidden` contains IDs without a colon separator
- **THEN** those legacy IDs SHALL be removed from storage

#### Scenario: Legacy read list entries without prefixed IDs are cleared
- **WHEN** the application loads and `newsflash:readlist` contains articles with IDs without a colon separator
- **THEN** those legacy entries SHALL be removed from storage

#### Scenario: Valid prefixed IDs are preserved during migration
- **WHEN** the application loads and storage contains a mix of legacy and prefixed IDs
- **THEN** only IDs containing the colon prefix separator SHALL be retained

## MODIFIED Requirements

### Requirement: Article states persist in localStorage
Hidden article IDs and Read List article IDs SHALL be persisted in localStorage so they survive page refreshes. Article IDs SHALL use the `${sourceId}:${hash}` format. On first load after upgrade, legacy IDs without the source prefix SHALL be cleared. When the user is authenticated and sync is enabled, both hidden articles and the read list SHALL participate in cross-device sync via the `useSyncedStorage` hook. The `useArticleState` hook SHALL use `useSyncedStorage` instead of `useLocalStorage` for the `newsflash:hidden` and `newsflash:readlist` keys.

#### Scenario: Hidden state persists
- **WHEN** the user hides an article and refreshes the page
- **THEN** the article SHALL still be hidden

#### Scenario: Read List persists
- **WHEN** the user saves an article and refreshes the page
- **THEN** the article SHALL still appear in the Read List

#### Scenario: Legacy data is cleared on upgrade
- **WHEN** the user loads the application for the first time after the ID format upgrade
- **THEN** legacy hidden IDs and read list entries without source prefix SHALL be cleared

#### Scenario: Hidden articles sync to remote
- **WHEN** the user hides articles and a sync cycle runs
- **THEN** the updated hidden list SHALL be pushed to Supabase if it is newer than the remote version

#### Scenario: Hidden articles pulled from remote
- **WHEN** a sync cycle detects a newer remote hidden list
- **THEN** the local hidden list SHALL be overwritten with the remote version

#### Scenario: Read list syncs to remote
- **WHEN** the user modifies the read list and a sync cycle runs
- **THEN** the updated read list SHALL be pushed to Supabase if it is newer than the remote version

#### Scenario: Read list pulled from remote
- **WHEN** a sync cycle detects a newer remote read list
- **THEN** the local read list SHALL be overwritten with the remote version

#### Scenario: Article state works without authentication
- **WHEN** the user is not authenticated
- **THEN** hidden articles and the read list SHALL work identically to the current behavior (localStorage only)

### Requirement: Action button visibility adapts to device and viewport
The hide and bookmark action buttons SHALL be hidden by default. On non-touch devices, they SHALL appear on card hover (`group-hover`) or keyboard focus (`group-focus-within`). On touch devices at the `md` breakpoint or above, they SHALL be persistently visible. On touch devices below the `md` breakpoint, they SHALL remain hidden (swipe gestures provide these actions).

#### Scenario: Touch device below md breakpoint
- **WHEN** the device has touch capability AND the viewport is below the `md` breakpoint
- **THEN** the action buttons SHALL NOT be displayed

#### Scenario: Touch device at md breakpoint or above
- **WHEN** the device has touch capability AND the viewport is at or above the `md` breakpoint
- **THEN** the action buttons SHALL be persistently visible

#### Scenario: Non-touch device hover
- **WHEN** the user hovers over an article card on a non-touch device
- **THEN** the action buttons SHALL become visible

#### Scenario: Keyboard focus within card
- **WHEN** keyboard focus is within an article card
- **THEN** the action buttons SHALL become visible

### Requirement: Save to Read List via swipe left on mobile
On touch devices, swiping an article card to the left SHALL add it to the Read List and hide it from the main feed. The swipe SHALL be integrated via `SwipeConfig` objects passed to `SwipeableCard`.

#### Scenario: Swipe left saves and hides article
- **WHEN** the user swipes an article card to the left on a touch device
- **THEN** the article SHALL be added to the Read List AND marked as hidden

#### Scenario: Swipe does not trigger navigation
- **WHEN** the user swipes an article card to save it
- **THEN** the browser SHALL NOT navigate to the article's link

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

### Requirement: Remove from Read List
Removing an article from the Read List SHALL remove it from the Read List view. The article SHALL remain hidden in the main feed. The button-triggered removal SHALL call `removeFromReadList` directly without routing through SwipeableCard's animation callback.

#### Scenario: Remove from Read List via button persists
- **WHEN** the user clicks the remove button on a read list article
- **THEN** the article SHALL be removed from localStorage and SHALL NOT reappear on page reload

#### Scenario: Remove from Read List keeps article hidden
- **WHEN** the user removes an article from the Read List (via button or swipe)
- **THEN** the article SHALL be removed from the Read List but SHALL remain hidden in the main feed

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

## From: bulk-article-actions/spec.md

## Requirements

### Requirement: Hide All button in main feed filter bar
The filter bar SHALL include a "Hide All" button that hides all currently visible articles.

#### Scenario: Hide All button is visible in filter bar
- **WHEN** the main feed is displayed
- **THEN** a "Hide All" button SHALL be visible in the filter bar

#### Scenario: Hide All respects current filters
- **WHEN** the user clicks "Hide All" with a search query active and a specific day selected
- **THEN** only articles matching the current day AND search query SHALL be hidden

#### Scenario: Hide All respects "All articles" mode
- **WHEN** the user clicks "Hide All" while in "All articles" mode with a search query
- **THEN** all articles matching the search query across all days SHALL be hidden

### Requirement: Hide All requires confirmation
Clicking "Hide All" SHALL display a confirmation dialog before executing the action.

#### Scenario: Confirmation dialog for Hide All
- **WHEN** the user clicks "Hide All"
- **THEN** an alert dialog SHALL appear with the message "Hide all articles for [day label]? This will hide N articles. You can show them again using Show Hidden."

#### Scenario: Cancel Hide All
- **WHEN** the user clicks "Cancel" in the Hide All confirmation dialog
- **THEN** no articles SHALL be hidden and the dialog SHALL close

#### Scenario: Confirm Hide All
- **WHEN** the user clicks "Hide All" in the confirmation dialog
- **THEN** all matching articles SHALL be hidden and the dialog SHALL close

### Requirement: Remove All button on read list page
The read list page SHALL include a "Remove All" button that removes all articles from the read list.

#### Scenario: Remove All button is visible
- **WHEN** the read list page has articles
- **THEN** a "Remove All" button SHALL be visible

#### Scenario: Remove All button hidden when empty
- **WHEN** the read list is empty
- **THEN** the "Remove All" button SHALL NOT be visible

### Requirement: Remove All requires confirmation
Clicking "Remove All" SHALL display a confirmation dialog before executing the action.

#### Scenario: Confirmation dialog for Remove All
- **WHEN** the user clicks "Remove All"
- **THEN** an alert dialog SHALL appear with the message "Remove all from read list? This will remove N articles from your read list. They will remain hidden in the main feed."

#### Scenario: Cancel Remove All
- **WHEN** the user clicks "Cancel" in the Remove All confirmation dialog
- **THEN** no articles SHALL be removed and the dialog SHALL close

#### Scenario: Confirm Remove All
- **WHEN** the user clicks "Remove All" in the confirmation dialog
- **THEN** all articles SHALL be removed from the read list and the dialog SHALL close

### Requirement: Undo toast after bulk actions
After a bulk action completes, a toast notification SHALL appear with an Undo button.

#### Scenario: Undo toast after Hide All
- **WHEN** the user confirms Hide All
- **THEN** a toast SHALL appear at the bottom-center showing "N articles hidden" with an Undo button

#### Scenario: Undo toast after Remove All
- **WHEN** the user confirms Remove All
- **THEN** a toast SHALL appear at the bottom-center showing "N articles removed from read list" with an Undo button

#### Scenario: Undo toast auto-dismisses
- **WHEN** the undo toast is shown and the user does not interact with it
- **THEN** the toast SHALL auto-dismiss after 5 seconds

#### Scenario: Undo restores hidden articles
- **WHEN** the user clicks Undo on the Hide All toast
- **THEN** all articles that were hidden by the bulk action SHALL be unhidden

#### Scenario: Undo restores read list articles
- **WHEN** the user clicks Undo on the Remove All toast
- **THEN** all articles that were removed SHALL be restored to the read list
