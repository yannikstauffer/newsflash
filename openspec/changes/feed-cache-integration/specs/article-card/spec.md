## ADDED Requirements

### Requirement: Adding to read list pins article in IDB cache

When an article is added to the read list, the system SHALL call `setPinned(id, true)` on the IndexedDB article cache. This call SHALL be fire-and-forget — failures SHALL be silently caught and SHALL NOT affect the read-list operation.

#### Scenario: Article pinned on save

- **WHEN** the user saves an article to the read list (via swipe, button, or keyboard shortcut)
- **THEN** `setPinned(article.id, true)` SHALL be called on the IDB cache
- **AND** the read-list add operation SHALL succeed regardless of whether the pin call succeeds

#### Scenario: IDB unavailable during pin

- **WHEN** the user saves an article and IndexedDB is unavailable
- **THEN** the read-list add operation SHALL succeed normally
- **AND** no error SHALL be surfaced to the user

### Requirement: Removing from read list unpins article in IDB cache

When an article is removed from the read list, the system SHALL call `setPinned(id, false)` on the IndexedDB article cache. This call SHALL be fire-and-forget — failures SHALL be silently caught and SHALL NOT affect the read-list operation. The unpinned article becomes eligible for time-based eviction.

#### Scenario: Article unpinned on removal

- **WHEN** the user removes an article from the read list
- **THEN** `setPinned(article.id, false)` SHALL be called on the IDB cache

#### Scenario: Clear read list unpins all articles

- **WHEN** the user clears the entire read list (via "Remove All")
- **THEN** `setPinned(id, false)` SHALL be called for each article that was in the read list
