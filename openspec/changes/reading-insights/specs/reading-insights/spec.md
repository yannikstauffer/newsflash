## ADDED Requirements

### Requirement: Insights page is accessible at /insights
The application SHALL provide an Insights page at the `/insights` route, lazy-loaded, displaying engagement statistics and noise-reduction recommendations based on collected stats data.

#### Scenario: Navigating to /insights renders the Insights page
- **WHEN** the user navigates to `/insights`
- **THEN** the application SHALL render the InsightsPage component

#### Scenario: Direct URL access to /insights
- **WHEN** the user enters `/insights` directly in the browser address bar
- **THEN** the application SHALL render the InsightsPage component without requiring navigation from another view

### Requirement: Insights page shows per-source engagement summary
The Insights page SHALL display, for each enabled source connector, the number of articles appeared, hidden, and saved over the last 14 days, along with a computed hide rate.

#### Scenario: Source with sufficient data shows stats
- **WHEN** a source has ≥ 5 appeared articles in the last 14 days
- **THEN** the Insights page SHALL show appeared count, hidden count, saved count, and hide rate for that source

#### Scenario: Source with insufficient data shows placeholder
- **WHEN** a source has fewer than 5 appeared articles in the last 14 days
- **THEN** the Insights page SHALL show a "not enough data yet" indicator for that source instead of stats

### Requirement: Insights page shows per-filter engagement summary
The Insights page SHALL display, for each connector filter, the number of articles that appeared in the feed matching that filter (i.e. when the filter was disabled), and how many of those were hidden or saved.

#### Scenario: Filter with appeared data shows stats
- **WHEN** a filter has ≥ 1 matched articles appeared in the last 14 days
- **THEN** the Insights page SHALL show matched-appeared count, matched-hidden count, and matched-saved count for that filter

#### Scenario: Filter with no appeared data shows zero-match indicator
- **WHEN** a filter has 0 matched articles in the last 14 days
- **THEN** the Insights page SHALL show a "no matching articles recently" indicator for that filter

### Requirement: Source noise recommendation
The Insights page SHALL display a "consider disabling" recommendation for any enabled source where the hide rate exceeds 50% over the last 14 days and at least 5 articles appeared.

#### Scenario: High hide-rate source gets recommendation
- **WHEN** a source has appeared ≥ 5 articles and hidden / appeared > 0.5 in the last 14 days
- **THEN** the Insights page SHALL display a recommendation to disable that source, including the hide count and appeared count

#### Scenario: Low hide-rate source does not get recommendation
- **WHEN** a source has appeared ≥ 5 articles and hidden / appeared ≤ 0.5
- **THEN** the Insights page SHALL NOT display a disable recommendation for that source

### Requirement: Filter enable recommendation
The Insights page SHALL recommend enabling a filter when the filter is currently disabled (user sees matching articles) and the hide rate among matched articles exceeds 50% over the last 14 days, with at least 5 matched articles.

#### Scenario: High hide-rate disabled filter gets enable recommendation
- **WHEN** a filter is disabled AND matched-appeared ≥ 5 AND matched-hidden / matched-appeared > 0.5 in the last 14 days
- **THEN** the Insights page SHALL display a "consider enabling this filter" recommendation for that filter

#### Scenario: Low hide-rate disabled filter gets no recommendation
- **WHEN** a filter is disabled AND matched-hidden / matched-appeared ≤ 0.5
- **THEN** the Insights page SHALL NOT display an enable recommendation for that filter

### Requirement: Filter disable recommendation
The Insights page SHALL recommend disabling a filter when the filter is currently enabled and at least one article in the current read list would match that filter.

#### Scenario: Enabled filter with read-list matches gets disable recommendation
- **WHEN** a filter is enabled AND at least one read-list article satisfies filter.match()
- **THEN** the Insights page SHALL display a "consider disabling this filter" recommendation, indicating how many read-list articles match

#### Scenario: Enabled filter with no read-list matches gets no recommendation
- **WHEN** a filter is enabled AND no read-list articles satisfy filter.match()
- **THEN** the Insights page SHALL NOT display a disable recommendation for that filter

### Requirement: Zero-engagement source detection
The Insights page SHALL flag any enabled source that has appeared === 0 for the last 7 or more days as "no recent articles", separately from the noise recommendation.

#### Scenario: Silent source gets flagged
- **WHEN** a source is enabled and has appeared === 0 across all stored day buckets spanning ≥ 7 days
- **THEN** the Insights page SHALL display a "no recent articles" indicator for that source

### Requirement: Insights page shows empty state when no data
When no stats have been collected yet (new install, or storage cleared), the Insights page SHALL show an informative empty state rather than blank content.

#### Scenario: Empty stats shows empty state message
- **WHEN** the stats store contains no day buckets
- **THEN** the Insights page SHALL render an empty state explaining that stats will appear after using the app for a few days
