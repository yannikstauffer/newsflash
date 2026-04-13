## ADDED Requirements

### Requirement: Feed data updates preserve array reference when content is unchanged
The `useFeedData` hook SHALL preserve the existing articles array reference when a background refresh produces the same set of articles in the same order. The hook SHALL only update the articles state with a new array reference when the article IDs or their order have changed.

#### Scenario: Background refresh returns identical articles
- **WHEN** a background refresh completes and the merged article list has the same IDs in the same order as the current state
- **THEN** the articles state SHALL NOT be updated (same reference preserved)
- **AND** downstream consumers SHALL NOT re-render due to article state changes

#### Scenario: Background refresh returns new articles
- **WHEN** a background refresh completes and the merged article list contains new article IDs or a different order
- **THEN** the articles state SHALL be updated with the new merged array

#### Scenario: Manual refresh always updates
- **WHEN** the user triggers a manual refresh via pull-to-refresh
- **THEN** the articles state SHALL be updated with the fresh data regardless of whether IDs changed (loading state already provides visual feedback)
