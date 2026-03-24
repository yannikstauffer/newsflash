## MODIFIED Requirements

### Requirement: useArticleState branch coverage meets threshold
The test suite SHALL cover all branching paths in `useArticleState` to achieve at least 80% branch coverage. Currently at 72.72% branches — missing coverage for `unhideArticles`, `clearReadList`, `restoreReadList` (capacity overflow branch), and the `readListArticles`/`readListIds` derived memos.

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

## ADDED Requirements

### Requirement: extract-leading-image branch coverage meets threshold
The test suite SHALL cover the uncovered branches in `extract-leading-image.ts` to achieve at least 80% branch coverage.

#### Scenario: Input with no images returns undefined
- **WHEN** `extractLeadingImage` is called with HTML containing no `<img>` tags
- **THEN** it SHALL return undefined

#### Scenario: Image with empty src is skipped
- **WHEN** `extractLeadingImage` is called with HTML containing an `<img>` with empty `src`
- **THEN** that image SHALL be skipped and the function SHALL return the next valid image or undefined

#### Scenario: Image with relative URL is resolved
- **WHEN** `extractLeadingImage` is called with HTML containing an `<img>` with a relative `src` and a base URL is provided
- **THEN** the returned URL SHALL be the resolved absolute URL

#### Scenario: Image with data URI is skipped
- **WHEN** `extractLeadingImage` is called with an `<img>` whose `src` is a data URI
- **THEN** that image SHALL be skipped

### Requirement: feed-config-page function coverage meets threshold
The test suite SHALL cover uncovered functions in `feed-config-page.tsx` to achieve at least 80% function coverage.

#### Scenario: All feed groups are rendered
- **WHEN** `FeedConfigPage` is rendered with multiple connector groups
- **THEN** each group SHALL be displayed as a section with its feeds

#### Scenario: Language selector triggers preference change
- **WHEN** the language select value is changed
- **THEN** the `i18n.changeLanguage` function SHALL be called with the new language

#### Scenario: Theme toggle updates preference
- **WHEN** the theme toggle is clicked
- **THEN** the theme preference SHALL be toggled between light and dark
