## ADDED Requirements

### Requirement: Feed route search param schema
The feed route (`/`) SHALL validate URL search params using a Zod schema with the following optional fields: `date` (ISO date string), `view` (enum: `"all"`), `q` (string, max 200), `hidden` (boolean). Malformed values SHALL silently fall back to `undefined`.

#### Scenario: Valid date param
- **WHEN** the user navigates to `/?date=2026-04-03`
- **THEN** the feed SHALL display articles for April 3, 2026

#### Scenario: Invalid date param falls back to today
- **WHEN** the user navigates to `/?date=not-a-date`
- **THEN** the feed SHALL display articles for today

#### Scenario: Valid view param
- **WHEN** the user navigates to `/?view=all`
- **THEN** the feed SHALL display articles from all dates

#### Scenario: Invalid view param falls back to day view
- **WHEN** the user navigates to `/?view=invalid`
- **THEN** the feed SHALL display articles for today (day view)

#### Scenario: Valid search param
- **WHEN** the user navigates to `/?q=bitcoin`
- **THEN** the feed SHALL filter articles matching "bitcoin"

#### Scenario: Search param exceeding max length is truncated
- **WHEN** the user navigates with a `q` param exceeding 200 characters
- **THEN** the param SHALL fall back to `undefined` and no search filter SHALL be applied

#### Scenario: Valid hidden param
- **WHEN** the user navigates to `/?hidden=true`
- **THEN** the feed SHALL show hidden articles

#### Scenario: Invalid hidden param falls back to not showing hidden
- **WHEN** the user navigates to `/?hidden=banana`
- **THEN** hidden articles SHALL NOT be shown

### Requirement: Default params are omitted from URL
When a search param matches its default value, it SHALL be omitted from the URL to keep links clean. Defaults: no `date` (today), no `view` (day view), no `q` (no search), no `hidden` (hidden off).

#### Scenario: Navigating to today omits date param
- **WHEN** the user navigates to today's date via day navigation
- **THEN** the URL SHALL be `/` without a `date` param

#### Scenario: Clearing search omits q param
- **WHEN** the user clears the search input
- **THEN** the URL SHALL not contain a `q` param

#### Scenario: Disabling hidden omits hidden param
- **WHEN** the user toggles hidden articles off
- **THEN** the URL SHALL not contain a `hidden` param

#### Scenario: Switching from all to day view omits view param
- **WHEN** the user toggles from "all articles" back to day view
- **THEN** the URL SHALL not contain a `view` param

### Requirement: View mode and date param interaction
When `view=all` is active, the `date` param SHALL be irrelevant. Toggling from "all articles" back to day view SHALL remove the `view` param and default `date` to today.

#### Scenario: All articles mode ignores date
- **WHEN** the URL is `/?view=all&date=2026-04-03`
- **THEN** the feed SHALL display articles from all dates, ignoring the `date` param

#### Scenario: Exiting all articles mode resets to today
- **WHEN** the user toggles from "all articles" to day view
- **THEN** the `view` param SHALL be removed and the `date` param SHALL be absent (defaulting to today)

### Requirement: Combined search params
Multiple search params SHALL combine correctly. All active filters apply simultaneously.

#### Scenario: Date and search combined
- **WHEN** the user navigates to `/?date=2026-04-02&q=react`
- **THEN** the feed SHALL display only articles from April 2, 2026 that match "react"

#### Scenario: All params combined
- **WHEN** the user navigates to `/?date=2026-04-02&q=react&hidden=true`
- **THEN** the feed SHALL display articles from April 2, 2026 matching "react" including hidden articles

### Requirement: Page refresh preserves view state
Refreshing the browser SHALL restore the exact same view state from the URL search params.

#### Scenario: Refresh preserves date and search
- **WHEN** the user is viewing `/?date=2026-04-01&q=tech` and refreshes the page
- **THEN** the feed SHALL display articles for April 1, 2026 filtered by "tech"

#### Scenario: Refresh preserves all articles view
- **WHEN** the user is viewing `/?view=all` and refreshes the page
- **THEN** the feed SHALL display articles from all dates
