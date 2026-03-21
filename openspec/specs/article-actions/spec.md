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
Hidden article IDs and Read List article IDs SHALL be persisted in localStorage so they survive page refreshes. Article IDs SHALL use the `${sourceId}:${hash}` format. On first load after upgrade, legacy IDs without the source prefix SHALL be cleared.

#### Scenario: Hidden state persists
- **WHEN** the user hides an article and refreshes the page
- **THEN** the article SHALL still be hidden

#### Scenario: Read List persists
- **WHEN** the user saves an article and refreshes the page
- **THEN** the article SHALL still appear in the Read List

#### Scenario: Legacy data is cleared on upgrade
- **WHEN** the user loads the application for the first time after the ID format upgrade
- **THEN** legacy hidden IDs and read list entries without source prefix SHALL be cleared
