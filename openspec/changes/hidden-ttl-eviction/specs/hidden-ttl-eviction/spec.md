## ADDED Requirements

### Requirement: Hidden article IDs are stored with a timestamp
The system SHALL store each hidden article ID alongside an ISO-8601 `hiddenAt` timestamp in `localStorage` under `newsflash:hidden`, using the shape `Array<{ id: string, hiddenAt: string }>`.

#### Scenario: Hiding an article persists a timestamped entry
- **WHEN** `hideArticle(id)` is called
- **THEN** `localStorage["newsflash:hidden"]` SHALL contain `{ id, hiddenAt: <current ISO timestamp> }`

#### Scenario: Batch hiding persists timestamps for all entries
- **WHEN** `hideArticles([id1, id2])` is called
- **THEN** both entries SHALL be stored with the current ISO timestamp

### Requirement: Hidden article entries expire after 14 days
The system SHALL discard hidden article entries whose `hiddenAt` timestamp is more than 14 days before the current time (`HIDDEN_TTL_DAYS = 14`).

#### Scenario: Expired entry is excluded from hiddenIds on read
- **WHEN** an entry's `hiddenAt` is more than 14 days ago
- **THEN** that ID SHALL NOT appear in `hiddenIds` and `isHidden(id)` SHALL return `false`, without any write having occurred

#### Scenario: Expired entry is dropped on next write
- **WHEN** `hideArticle` is called and some existing entries are older than 14 days
- **THEN** the expired entries SHALL be removed from storage and SHALL NOT appear in `hiddenIds`

#### Scenario: Recent entries within the window are kept
- **WHEN** an entry's `hiddenAt` is within 14 days
- **THEN** that ID SHALL remain in `hiddenIds`

#### Scenario: No count cap is enforced
- **WHEN** more than 500 entries are stored, all within the 14-day window
- **THEN** all entries SHALL be retained and none SHALL be evicted

### Requirement: HIDDEN_TTL_DAYS is exported
The `HIDDEN_TTL_DAYS = 14` constant SHALL be exported from `use-article-state.ts`.

#### Scenario: Constant is accessible to importers
- **WHEN** a module imports `HIDDEN_TTL_DAYS` from `use-article-state`
- **THEN** the value SHALL be `14`

### Requirement: Legacy string[] storage is migrated transparently
- **WHEN** `newsflash:hidden` in localStorage contains a plain `string[]` (legacy format from an older build or synced from an older device)
- **THEN** each string SHALL be mapped to `{ id: string, hiddenAt: <current time> }` and the normalized array SHALL be written back to storage without losing any existing hides

#### Scenario: Legacy entries receive a fresh timestamp
- **WHEN** the hook reads a `string[]` from storage
- **THEN** each entry SHALL be converted to `{ id, hiddenAt: now }` and remain visible in `hiddenIds`

#### Scenario: Source-prefix migration applies to entry.id
- **WHEN** storage contains entries (in either shape) where `id` does not include a colon
- **THEN** those entries SHALL be filtered out (legacy-id migration), operating on the `id` field of each entry

### Requirement: External API remains string[]
`useArticleState()` SHALL continue to return `hiddenIds: string[]` and `isHidden(id: string): boolean`, unchanged from the current API.

#### Scenario: hiddenIds is a plain string array
- **WHEN** `useArticleState()` is called with timestamped storage
- **THEN** `hiddenIds` SHALL be a `string[]` containing only the `id` fields of non-expired entries

#### Scenario: isHidden reflects TTL-filtered state
- **WHEN** `isHidden(id)` is called for an expired entry
- **THEN** it SHALL return `false`
