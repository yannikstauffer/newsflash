## ADDED Requirements

### Requirement: Unified chronological feed displays articles from all enabled sources
The feed view SHALL fetch articles from all enabled connectors, merge them into a single list, and display them sorted by `publishedAt` (newest first).

#### Scenario: Articles from multiple sources are merged chronologically
- **WHEN** the feed loads with multiple sources enabled
- **THEN** articles from all sources SHALL appear in a single list sorted by publish date, newest first

#### Scenario: Only enabled feeds are fetched
- **WHEN** a source or sub-feed is disabled in feed configuration
- **THEN** the feed SHALL NOT fetch or display articles from that source

### Requirement: URL-based deduplication
The feed SHALL deduplicate articles by their `link` field. If two articles share the same URL, only the first encountered SHALL be displayed.

#### Scenario: Duplicate URLs are removed
- **WHEN** two connectors return articles with the same `link`
- **THEN** only one article SHALL appear in the feed

### Requirement: Manual refresh
The feed SHALL fetch fresh data on page load and provide a refresh button. There is no automatic polling.

#### Scenario: Feed loads on page open
- **WHEN** the user opens or refreshes the page
- **THEN** the feed SHALL fetch all enabled feeds and display articles

#### Scenario: Refresh button fetches new data
- **WHEN** the user clicks the refresh button
- **THEN** the feed SHALL re-fetch all enabled feeds and update the displayed articles

### Requirement: Article cards link to original source
Each article card SHALL be a clickable link that opens the original article URL in a new tab.

#### Scenario: Clicking an article opens the source
- **WHEN** the user clicks/taps an article card
- **THEN** the browser SHALL open the article's `link` URL in a new tab

### Requirement: Article card displays key information
Each article card SHALL display the article title, source name, absolute publish time, and description. If an image URL is available, it SHALL be displayed.

#### Scenario: Article card shows all fields
- **WHEN** an article is rendered
- **THEN** the card SHALL show title, source name, absolute time, and description

#### Scenario: Article card shows image when available
- **WHEN** an article has an `imageUrl`
- **THEN** the card SHALL display the image

### Requirement: Loading and error states
The feed SHALL display a loading indicator while fetching and an error message if one or more feeds fail. Successful feeds SHALL still display even if others fail.

#### Scenario: Loading state during fetch
- **WHEN** feeds are being fetched
- **THEN** the UI SHALL display a loading indicator

#### Scenario: Partial failure shows available articles
- **WHEN** some feeds fail and others succeed
- **THEN** the feed SHALL display articles from successful feeds and show an error indicator for failed feeds

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

### Requirement: Lazy loading for card lists
All pages that display article cards (feed page, read list page) SHALL use lazy loading via intersection observer. Cards SHALL render in batches (10-20) and load more as the user scrolls.

#### Scenario: Initial render
- **WHEN** a card list is displayed
- **THEN** only the first batch of cards (10-20) SHALL be rendered

#### Scenario: Scroll triggers more cards
- **WHEN** the user scrolls near the bottom of the currently rendered cards
- **THEN** the next batch of cards SHALL be rendered

#### Scenario: All cards loaded
- **WHEN** all cards in the current view have been rendered
- **THEN** no further loading SHALL occur
