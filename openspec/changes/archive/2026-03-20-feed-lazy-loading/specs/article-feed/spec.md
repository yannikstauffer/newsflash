## ADDED Requirements

### Requirement: Lazy loading for card lists
All pages that display article cards (feed page, read list page) SHALL use lazy loading via intersection observer. Cards SHALL render in batches and load more as the user scrolls.

#### Scenario: Initial render
- **WHEN** a card list is displayed
- **THEN** only the first batch of cards (approximately 15) SHALL be rendered

#### Scenario: Scroll triggers more cards
- **WHEN** the user scrolls near the bottom of the currently rendered cards
- **THEN** the next batch of cards SHALL be rendered

#### Scenario: All cards loaded
- **WHEN** all cards in the current view have been rendered
- **THEN** no further loading SHALL occur

#### Scenario: Filter or day change resets batch
- **WHEN** the article list changes due to filter, search, or day navigation
- **THEN** the visible count SHALL reset to one batch
