## MODIFIED Requirements

### Requirement: Last-refreshed timestamp is displayed
The feed SHALL display a human-readable "last refreshed" timestamp in the unified status row so the user can assess data freshness. The timestamp SHALL be persisted to localStorage and hydrated synchronously on mount so it is available on first render.

#### Scenario: Timestamp shown after fetch completes
- **WHEN** a feed fetch completes successfully
- **THEN** the status row SHALL display the time of the last successful fetch (e.g., "Refreshed 2m ago")
- **AND** the timestamp SHALL be persisted to localStorage

#### Scenario: Timestamp updates on manual refresh
- **WHEN** the user clicks the refresh button and the fetch completes
- **THEN** the last-refreshed timestamp SHALL update to reflect the new fetch time
- **AND** the updated timestamp SHALL be persisted to localStorage

#### Scenario: Timestamp hydrated synchronously on mount
- **WHEN** the feed page mounts and a previously persisted `lastRefreshedAt` exists in localStorage
- **THEN** the timestamp SHALL be available on the first render without waiting for any async operation

#### Scenario: localStorage unavailable falls back to null
- **WHEN** localStorage is not available or contains no persisted timestamp
- **THEN** `lastRefreshedAt` SHALL initialize as null and update after the first successful network fetch
