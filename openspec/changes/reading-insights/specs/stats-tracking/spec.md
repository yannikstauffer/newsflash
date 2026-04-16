## ADDED Requirements

### Requirement: Stats are stored as daily buckets in localStorage
The system SHALL store engagement stats under the key `newsflash:stats` in localStorage using a versioned daily-bucket structure. Each day bucket is keyed by ISO date string (`YYYY-MM-DD`) and contains per-source and per-filter counters.

#### Scenario: Stats key is present after first tracking event
- **WHEN** the first tracking event (appeared, hidden, or saved) occurs
- **THEN** `localStorage.getItem("newsflash:stats")` SHALL return a valid JSON string matching the `StatsStore` shape with `version: 1`

#### Scenario: Stats structure contains today's bucket after tracking
- **WHEN** an article from source "heise" appears in the feed on 2026-04-14
- **THEN** `stats.days["2026-04-14"].sources["heise"].appeared` SHALL be incremented by 1

### Requirement: Stats track appeared, hidden, and saved per source per day
For each source connector, the system SHALL track three counters per day: `appeared` (articles rendered in the feed from this source), `hidden` (articles from this source that the user hid), and `saved` (articles from this source that the user added to the read list).

#### Scenario: Appeared increments when feed renders articles from a source
- **WHEN** the feed renders N articles from source "heise" on a given day
- **THEN** `stats.days[today].sources["heise"].appeared` SHALL equal the number of unique heise articles rendered in that session (deduplicated within the session)

#### Scenario: Hidden increments when user hides an article
- **WHEN** the user hides an article from source "engadget"
- **THEN** `stats.days[today].sources["engadget"].hidden` SHALL be incremented by 1

#### Scenario: Saved increments when user adds to read list
- **WHEN** the user adds an article from source "srf" to the read list
- **THEN** `stats.days[today].sources["srf"].saved` SHALL be incremented by 1

### Requirement: Stats track appeared, hidden, and saved per filter per day
For each connector filter that is currently disabled (the user sees matching articles), the system SHALL track three counters per day: `appeared` (articles rendered in the feed that match this filter), `hidden` (matched articles the user hid), and `saved` (matched articles the user saved).

#### Scenario: Filter appeared increments for disabled filter
- **WHEN** a filter is disabled AND an article matching filter.match() is rendered in the feed
- **THEN** `stats.days[today].filters[filterId].appeared` SHALL be incremented by 1

#### Scenario: Filter appeared does not increment for enabled filter
- **WHEN** a filter is enabled (articles are hidden) AND an article that would match the filter is NOT rendered
- **THEN** `stats.days[today].filters[filterId].appeared` SHALL NOT be incremented

#### Scenario: Filter hidden increments when user hides a matching article
- **WHEN** the user hides an article that matches a disabled filter
- **THEN** `stats.days[today].filters[filterId].hidden` SHALL be incremented by 1

### Requirement: Session-level deduplication for appeared counts
Within a single browser session, each article ID SHALL be counted at most once for the `appeared` counter, regardless of how many times the feed re-renders or the user navigates between dates.

#### Scenario: Re-rendering the feed does not double-count appeared
- **WHEN** the feed renders an article with ID "heise:abc" and then re-renders the same article (e.g. after a refresh) in the same session
- **THEN** `stats.days[today].sources["heise"].appeared` SHALL NOT be incremented a second time for that article

### Requirement: Stats day buckets are evicted after 90 days
On every write to the stats store, the system SHALL delete any day buckets older than 90 days from today.

#### Scenario: Old day buckets are removed on write
- **WHEN** a stats write occurs and the store contains a bucket for a date more than 90 days in the past
- **THEN** that bucket SHALL be absent from the store after the write

#### Scenario: Recent day buckets are not evicted
- **WHEN** a stats write occurs and the store contains a bucket for a date within the last 90 days
- **THEN** that bucket SHALL remain in the store after the write

### Requirement: Stats are synced across devices using additive merge
The stats key (`newsflash:stats`) SHALL be included in the sync pipeline. Unlike other synced keys, stats SHALL use an additive merge strategy: for each day bucket and each counter, the merged value is `remote_value + (current_local - last_synced_snapshot)`.

#### Scenario: Stats from two devices are additive after sync
- **WHEN** Device A has `sources["heise"].appeared = 5` for 2026-04-14 and Device B has `sources["heise"].appeared = 3` for the same day and both devices sync
- **THEN** both devices SHALL converge to `sources["heise"].appeared = 8` for 2026-04-14

#### Scenario: Re-syncing from the same device does not double-count
- **WHEN** Device A syncs, resulting in `sources["heise"].appeared = 5` on the remote, and then Device A syncs again without any new events
- **THEN** `sources["heise"].appeared` on the remote SHALL remain 5

### Requirement: Synced snapshot is stored locally for delta computation
After each successful stats sync, the system SHALL persist a local snapshot of the last-synced stats state under `newsflash:stats:synced-snapshot`. This snapshot is used to compute the delta on the next sync and is never synced to the remote.

#### Scenario: Snapshot is updated after successful sync
- **WHEN** a stats sync completes successfully
- **THEN** `localStorage.getItem("newsflash:stats:synced-snapshot")` SHALL contain the merged stats value that was written to the remote

#### Scenario: Snapshot is not present on a fresh install
- **WHEN** a user installs the app for the first time and no sync has occurred
- **THEN** `newsflash:stats:synced-snapshot` SHALL be absent from localStorage and the full local stats SHALL be treated as the delta

### Requirement: Stats schema includes a version field
The stats store SHALL include a `version` field set to `1`. This field enables future schema migrations.

#### Scenario: Version field is present
- **WHEN** the stats store is read from localStorage
- **THEN** `stats.version` SHALL equal `1`
