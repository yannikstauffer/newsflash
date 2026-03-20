## ADDED Requirements

### Requirement: Day-based pagination
The feed SHALL be paginated by day. All articles are fetched upfront; pagination is a client-side UI grouping by `publishedAt` date.

#### Scenario: Default view shows today
- **WHEN** the feed loads
- **THEN** the feed SHALL display articles from today's date, even if today has no articles

#### Scenario: Navigate to previous day
- **WHEN** the user clicks the "prev" button
- **THEN** the feed SHALL display articles from the previous calendar day (not skipping empty days)

#### Scenario: Navigate to next day
- **WHEN** the user clicks the "next" button while viewing a past day
- **THEN** the feed SHALL display articles from the next calendar day

#### Scenario: Next button disabled on today
- **WHEN** the user is viewing today's articles
- **THEN** the "next" button SHALL be disabled

#### Scenario: Empty day
- **WHEN** the user navigates to a day with no articles (after filters are applied)
- **THEN** the feed SHALL display a message like "no articles for this day" with prev/next navigation still available

#### Scenario: Filters apply within current day
- **WHEN** the user has active filters (source, language, search)
- **THEN** filters SHALL apply to the articles within the currently viewed day

### Requirement: Day pagination header
The pagination header SHALL display the current day label and prev/next navigation buttons. The day label SHALL use lowercase convention.

#### Scenario: Today label
- **WHEN** viewing today (2026-03-20)
- **THEN** the header SHALL display `today, 20.03.2026`

#### Scenario: Yesterday label
- **WHEN** viewing yesterday (2026-03-19)
- **THEN** the header SHALL display `yesterday, 19.03.2026`

#### Scenario: Older day label
- **WHEN** viewing a day older than yesterday (e.g., 2026-03-18, a Wednesday)
- **THEN** the header SHALL display `wednesday, 18.03.2026` (always include the weekday name, lowercase)

### Requirement: All articles view
The feed SHALL provide an "All articles" toggle that switches from day-based pagination to showing all articles at once.

#### Scenario: Switching to all articles
- **WHEN** the user clicks "All articles"
- **THEN** the feed SHALL display all fetched articles (filtered by active filters) without day grouping, and the prev/next buttons SHALL be hidden

#### Scenario: Switching back to day view
- **WHEN** the user exits the "All articles" view
- **THEN** the feed SHALL return to day-based pagination starting at today
