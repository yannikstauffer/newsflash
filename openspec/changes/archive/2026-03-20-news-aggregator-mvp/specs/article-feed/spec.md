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
Each article card SHALL display the article title, source name, relative publish time, and description. If an image URL is available, it SHALL be displayed.

#### Scenario: Article card shows all fields
- **WHEN** an article is rendered
- **THEN** the card SHALL show title, source name, relative time (e.g., "5 min ago"), and description

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
