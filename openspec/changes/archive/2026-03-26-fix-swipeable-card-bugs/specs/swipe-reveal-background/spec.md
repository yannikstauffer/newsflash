## MODIFIED Requirements

### Requirement: Swipe reveals colored background with action icon
When the user swipes an article card horizontally, a colored background with an action icon SHALL be revealed behind the card as it translates. The feed SHALL pass full `SwipeConfig` objects (with `bgClassName`, `icon`, and `onAction`) to `SwipeableCard`.

#### Scenario: Swipe right in main feed reveals amber background with eye-off icon
- **WHEN** the user swipes an article card to the right in the main feed
- **THEN** an amber background (`bg-amber-100 dark:bg-amber-900/30`) with an `EyeOff` icon SHALL be visible behind the card

#### Scenario: Swipe left in main feed reveals blue background with bookmark icon
- **WHEN** the user swipes an article card to the left in the main feed
- **THEN** a blue background (`bg-blue-100 dark:bg-blue-900/30`) with a `BookmarkPlus` icon SHALL be visible behind the card

#### Scenario: Swipe right in read list reveals red background with x-circle icon
- **WHEN** the user swipes an article card to the right in the read list
- **THEN** a red background (`bg-red-100 dark:bg-red-900/30`) with an `XCircle` icon SHALL be visible behind the card
