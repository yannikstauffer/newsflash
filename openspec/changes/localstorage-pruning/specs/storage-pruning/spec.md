## ADDED Requirements

### Requirement: Hidden IDs list is bounded
The system SHALL enforce a maximum of 500 entries in the hidden article IDs list. When a new ID is added that would cause the list to exceed 500 entries, the system SHALL remove the oldest entries (from the tail) to maintain the limit.

#### Scenario: Adding a hidden ID within limit
- **WHEN** the hidden IDs list contains fewer than 500 entries and a new article is hidden
- **THEN** the new ID is prepended to the list and no entries are removed

#### Scenario: Adding a hidden ID at capacity
- **WHEN** the hidden IDs list contains exactly 500 entries and a new article is hidden
- **THEN** the new ID is prepended and the oldest entry (last in the array) is removed, keeping the total at 500

#### Scenario: Existing oversized hidden list is pruned on next write
- **WHEN** the hidden IDs list contains more than 500 entries (from before pruning was introduced) and a new article is hidden
- **THEN** the new ID is prepended and the list is truncated to 500 entries from the head

#### Scenario: Duplicate hidden ID is not added
- **WHEN** an article ID that is already in the hidden list is hidden again
- **THEN** the list remains unchanged and no pruning occurs

### Requirement: Read list is bounded
The system SHALL enforce a maximum of 200 entries in the read list. When a new article is added that would cause the list to exceed 200 entries, the system SHALL remove the oldest entries (from the tail) to maintain the limit.

#### Scenario: Adding an article to read list within limit
- **WHEN** the read list contains fewer than 200 articles and a new article is saved
- **THEN** the new article is prepended to the list and no entries are removed

#### Scenario: Adding an article to read list at capacity
- **WHEN** the read list contains exactly 200 articles and a new article is saved
- **THEN** the new article is prepended and the oldest article (last in the array) is removed, keeping the total at 200

#### Scenario: Existing oversized read list is pruned on next write
- **WHEN** the read list contains more than 200 articles (from before pruning was introduced) and a new article is saved
- **THEN** the new article is prepended and the list is truncated to 200 entries from the head

#### Scenario: Duplicate article is not added to read list
- **WHEN** an article that is already in the read list is saved again
- **THEN** the list remains unchanged and no pruning occurs

### Requirement: Pruning limits are exported constants
The system SHALL define the maximum hidden IDs limit (500) and maximum read list limit (200) as named, exported constants so that tests and other consumers can reference them.

#### Scenario: Constants are importable
- **WHEN** a test file imports `MAX_HIDDEN_IDS` and `MAX_READLIST_ITEMS` from the article state module
- **THEN** the values SHALL be 500 and 200 respectively
