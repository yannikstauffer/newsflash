## ADDED Requirements

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
