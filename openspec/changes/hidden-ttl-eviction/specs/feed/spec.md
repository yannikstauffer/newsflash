## MODIFIED Requirements

### Requirement: useArticleState branch coverage meets threshold
The test suite SHALL cover all branching paths in `useArticleState` to achieve at least 80% branch coverage. The `hideArticle pruning` describe block (count-cap tests) SHALL be deleted. The `time-based eviction (14-day window)` describe block tests are the normative coverage for hide-persistence behavior.

#### Scenario: unhideArticles removes multiple IDs
- **WHEN** `unhideArticles` is called with an array of IDs
- **THEN** all specified IDs SHALL be removed from `hiddenIds`

#### Scenario: unhideArticles with IDs not in the list
- **WHEN** `unhideArticles` is called with IDs that are not hidden
- **THEN** `hiddenIds` SHALL remain unchanged

#### Scenario: clearReadList empties the read list
- **WHEN** `clearReadList` is called
- **THEN** `readListArticles` SHALL be an empty array AND `readListIds` SHALL be an empty array

#### Scenario: restoreReadList adds articles without duplicates
- **WHEN** `restoreReadList` is called with articles, some already in the read list
- **THEN** only new articles SHALL be prepended and duplicates SHALL be skipped

#### Scenario: restoreReadList caps at MAX_READLIST_ITEMS
- **WHEN** `restoreReadList` is called with enough articles to exceed MAX_READLIST_ITEMS
- **THEN** the resulting read list SHALL be truncated to MAX_READLIST_ITEMS

#### Scenario: readListIds reflects stored article IDs
- **WHEN** articles are added to the read list
- **THEN** `readListIds` SHALL contain exactly the IDs of stored articles in order

#### Scenario: readListArticles deserializes stored articles
- **WHEN** articles are added to the read list
- **THEN** `readListArticles` SHALL contain NormalizedArticle objects with `publishedAt` as Date instances
