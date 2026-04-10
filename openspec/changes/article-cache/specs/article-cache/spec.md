## ADDED Requirements

### Requirement: Database initialization

The article cache SHALL open (or create) an IndexedDB database named `newsflash-articles` with version 1. The database SHALL contain a single object store named `articles` with keyPath `id`. The store SHALL have indexes on `publishedAt`, `source`, and `pinned`.

#### Scenario: First-time initialization

- **WHEN** the cache is accessed for the first time (no existing database)
- **THEN** the database and object store are created with all indexes
- **AND** all subsequent operations work without error

#### Scenario: Database already exists

- **WHEN** the cache is accessed and the database already exists at the current version
- **THEN** the existing database is opened without modification

#### Scenario: IndexedDB unavailable

- **WHEN** IndexedDB is not available (e.g., private browsing restrictions)
- **THEN** all read operations SHALL return empty results
- **AND** all write operations SHALL be no-ops (no errors thrown)

### Requirement: Bulk upsert articles

The cache SHALL provide an `upsertMany(articles)` function that accepts an array of `NormalizedArticle` objects. Each article SHALL be stored as a `CachedArticle` with `pinned` defaulting to `false` and `cachedAt` set to the current time. If an article with the same `id` already exists, it SHALL be updated but its `pinned` and `cachedAt` values SHALL be preserved. After upserting, eviction SHALL run automatically.

#### Scenario: Insert new articles

- **WHEN** `upsertMany` is called with articles whose IDs do not exist in the cache
- **THEN** all articles are stored with `pinned: false` and `cachedAt` set to now

#### Scenario: Update existing articles

- **WHEN** `upsertMany` is called with articles whose IDs already exist in the cache
- **THEN** the article fields (title, description, link, etc.) are updated
- **AND** the existing `pinned` and `cachedAt` values are preserved

#### Scenario: Mixed insert and update

- **WHEN** `upsertMany` is called with a mix of new and existing article IDs
- **THEN** new articles are inserted and existing articles are updated
- **AND** eviction runs after the upsert completes

### Requirement: Retrieve all articles

The cache SHALL provide a `getAll()` function that returns all cached articles as `NormalizedArticle` objects (without the `pinned` and `cachedAt` fields).

#### Scenario: Cache has articles

- **WHEN** `getAll` is called and the cache contains articles
- **THEN** all articles are returned as `NormalizedArticle` objects

#### Scenario: Cache is empty

- **WHEN** `getAll` is called and the cache is empty
- **THEN** an empty array is returned

### Requirement: Retrieve articles by date range

The cache SHALL provide a `getByDateRange(start, end)` function that returns all articles with `publishedAt` within the inclusive range `[start, end]`.

#### Scenario: Articles exist within range

- **WHEN** `getByDateRange` is called with a range that contains cached articles
- **THEN** only articles within that date range are returned

#### Scenario: No articles in range

- **WHEN** `getByDateRange` is called with a range that contains no cached articles
- **THEN** an empty array is returned

### Requirement: Pin and unpin articles

The cache SHALL provide a `setPinned(id, pinned)` function that sets the `pinned` flag on a cached article. Pinned articles are exempt from time-based eviction.

#### Scenario: Pin an existing article

- **WHEN** `setPinned` is called with an existing article ID and `pinned: true`
- **THEN** the article's `pinned` flag is set to `true`

#### Scenario: Unpin an existing article

- **WHEN** `setPinned` is called with an existing article ID and `pinned: false`
- **THEN** the article's `pinned` flag is set to `false`

#### Scenario: Pin a non-existent article

- **WHEN** `setPinned` is called with an ID that does not exist in the cache
- **THEN** the operation is a no-op (no error thrown)

### Requirement: Time-based eviction with pin exemption

The cache SHALL provide an `evict(maxAgeDays)` function that deletes all articles where `pinned === false` AND `publishedAt` is older than `maxAgeDays` days from now. Pinned articles SHALL never be evicted regardless of age. The default `maxAgeDays` SHALL be 14.

#### Scenario: Evict old unpinned articles

- **WHEN** `evict` is called and the cache contains unpinned articles older than `maxAgeDays`
- **THEN** those articles are deleted from the cache

#### Scenario: Pinned articles are preserved

- **WHEN** `evict` is called and the cache contains pinned articles older than `maxAgeDays`
- **THEN** those articles are NOT deleted

#### Scenario: No articles to evict

- **WHEN** `evict` is called and all articles are either pinned or within the retention window
- **THEN** no articles are deleted

### Requirement: CachedArticle schema

A `CachedArticle` SHALL contain all fields from `NormalizedArticle` (`id`, `title`, `description`, `link`, `publishedAt`, `source`, `language`, `imageUrl?`, `category?`) plus `pinned: boolean` and `cachedAt: Date`.

#### Scenario: Convert NormalizedArticle to CachedArticle

- **WHEN** a `NormalizedArticle` is stored via `upsertMany`
- **THEN** it is persisted as a `CachedArticle` with all original fields preserved, `pinned` set to `false`, and `cachedAt` set to the current timestamp

#### Scenario: Convert CachedArticle to NormalizedArticle on read

- **WHEN** articles are read via `getAll` or `getByDateRange`
- **THEN** they are returned as `NormalizedArticle` objects (without `pinned` or `cachedAt`)
