## ADDED Requirements

### Requirement: Pending articles buffer
After the initial feed load, new articles arriving from background refreshes SHALL be held in a pending buffer and SHALL NOT be automatically merged into the displayed feed. The pending buffer SHALL be cleared when the user accepts pending articles or triggers a manual refresh.

#### Scenario: Background refresh produces new articles
- **WHEN** a background refresh completes and the displayed feed already contains articles
- **THEN** newly discovered articles are held in the pending buffer and the displayed feed remains unchanged

#### Scenario: Manual pull-to-refresh bypasses the buffer
- **WHEN** the user triggers a manual pull-to-refresh
- **THEN** all pending and new articles are merged immediately into the displayed feed and the pending buffer is cleared

#### Scenario: Initial load is unaffected
- **WHEN** the feed loads for the first time (displayed list is empty)
- **THEN** articles are shown directly without going through the pending buffer

### Requirement: "Show X newer articles" button
The feed list SHALL render a button at the top of the article list when the pending buffer contains one or more articles. The button SHALL be inline in the normal document flow (not sticky, not a fixed overlay). The button SHALL display a refresh icon and the exact count of pending articles.

#### Scenario: Button appears when pending articles exist
- **WHEN** the pending buffer contains one or more articles
- **THEN** a button labelled "Show N newer articles" (where N is the pending count) is rendered as the first element of the feed list

#### Scenario: Button is absent when no pending articles
- **WHEN** the pending buffer is empty
- **THEN** no button is rendered and the feed list begins with the first article

#### Scenario: Button click merges pending into feed
- **WHEN** the user clicks the "Show X newer articles" button
- **THEN** pending articles are merged into the displayed feed, the pending buffer is cleared, and the button disappears

#### Scenario: Button scrolls with content
- **WHEN** the user has scrolled past the top of the feed
- **THEN** the button is not visible (it scrolls out of view with the rest of the list, and becomes visible again as articles are hidden/bookmarked and the list shrinks)

### Requirement: Stable feed-enabled predicate
The `isFeedEnabled` function returned by `useFeedPreferences` SHALL maintain a stable reference across re-renders caused by sync-triggered preference updates, so that the feed fetch effect is not retriggered by preference changes alone.

#### Scenario: Sync updates feed preferences
- **WHEN** Supabase sync writes new data to `newsflash:feed-prefs`
- **THEN** `isFeedEnabled` returns the updated values on the next call but its reference identity does not change, and the feed data fetch effect does not re-run

#### Scenario: Filtering still updates immediately
- **WHEN** feed preferences change (via sync or user action)
- **THEN** the displayed article list is re-filtered using the updated preferences within the same render cycle
