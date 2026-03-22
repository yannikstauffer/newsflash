## ADDED Requirements

### Requirement: Feed configuration UI lists all pre-defined feeds
The feed configuration view SHALL display all feeds from the connector registry, grouped by source. Within each source, feeds with a `group` property SHALL be rendered in collapsible group sections. Feeds without a `group` property SHALL render flat as individual checkboxes.

#### Scenario: All feeds are listed
- **WHEN** the user opens feed configuration
- **THEN** all feeds from all connectors SHALL be listed, grouped by source name

#### Scenario: Grouped feeds render in collapsible sections
- **WHEN** a connector has feeds with `group` properties
- **THEN** feeds SHALL be clustered by group into collapsible sections within the connector's card

#### Scenario: Ungrouped feeds render flat
- **WHEN** a connector has feeds without `group` properties
- **THEN** those feeds SHALL render as individual checkboxes directly under the connector header (existing behavior)

#### Scenario: Mixed grouped and ungrouped feeds
- **WHEN** a connector has both grouped and ungrouped feeds
- **THEN** ungrouped feeds SHALL render flat and grouped feeds SHALL render in their collapsible sections

### Requirement: Feeds default to enabled
All feeds SHALL be enabled by default when the user first loads the application (no prior preferences in localStorage).

#### Scenario: First load enables all feeds
- **WHEN** the user opens the app for the first time (no localStorage data)
- **THEN** all feeds SHALL be enabled

### Requirement: Feed preferences persist in localStorage
Enabled/disabled state for each feed SHALL be stored in localStorage and restored on page load.

#### Scenario: Disabled feed stays disabled after refresh
- **WHEN** the user disables a feed and refreshes the page
- **THEN** the feed SHALL remain disabled

#### Scenario: Preferences survive across sessions
- **WHEN** the user closes and reopens the browser
- **THEN** feed preferences SHALL be restored from localStorage

### Requirement: Source-level toggle
Each source SHALL have a master toggle that enables or disables all of its sub-feeds at once, including feeds across all groups.

#### Scenario: Disable entire source
- **WHEN** the user toggles off a source (e.g., "SRF")
- **THEN** all sub-feeds under that source SHALL be disabled, across all groups

#### Scenario: Enable entire source
- **WHEN** the user toggles on a source
- **THEN** all sub-feeds under that source SHALL be enabled, across all groups

#### Scenario: Source checkbox indeterminate with groups
- **WHEN** some feeds across different groups are enabled and others are disabled
- **THEN** the source-level checkbox SHALL display in an indeterminate state

### Requirement: Language selector on settings page
The settings page language selector SHALL be repurposed from a feed language filter to an app locale selector.

#### Scenario: Language selector rendering
- **WHEN** the settings page is displayed
- **THEN** a language section with two options ("Deutsch", "English") SHALL appear above the "Sources" section

#### Scenario: Language selection changes app locale
- **WHEN** the user selects "Deutsch"
- **THEN** the app UI SHALL switch to German AND the preference SHALL be saved to `localStorage("newsflash:locale")`

### Requirement: Settings page structured layout
The settings page SHALL use a structured layout with clearly labeled sections, card-style grouping for sources, and visual dividers between sources. The layout SHALL include a page heading.

#### Scenario: Settings page rendering
- **WHEN** the user opens the settings page
- **THEN** the page SHALL display a translated "Settings" heading, a "Language" section with the locale selector, and a "Sources" section with each source in a card-like group separated by dividers

#### Scenario: Source card display
- **WHEN** a source with sub-feeds is rendered
- **THEN** the source name and language badge SHALL appear as a header, with sub-feed checkboxes indented below, all within a visually grouped container

### Requirement: localStorage cleanup on feed deactivation
When all feeds for a source are deactivated, the application SHALL remove related data from localStorage to keep storage clean. This includes removing hidden article IDs and read list entries that belong to the deactivated source.

#### Scenario: Deactivating a source cleans up hidden IDs
- **WHEN** the user disables all feeds for source "heise"
- **THEN** hidden article IDs from "heise" SHALL be removed from the `newsflash:hidden` localStorage entry

#### Scenario: Deactivating a source cleans up read list
- **WHEN** the user disables all feeds for source "heise"
- **THEN** read list entries with `source: "heise"` SHALL be removed from the `newsflash:readlist` localStorage entry

#### Scenario: Deactivating a single sub-feed
- **WHEN** the user disables a single sub-feed but other feeds from the same source remain active
- **THEN** no cleanup SHALL occur (cleanup only triggers when all feeds for a source are disabled)

## REMOVED Requirements

### ~~Requirement: Language selector uses feed preferences storage~~
The language preference is no longer stored in the `newsflash:feed-prefs` localStorage entry under `_language`. It is now stored separately in `newsflash:locale` and controls the app locale rather than feed filtering.
