## ADDED Requirements

### Requirement: Language selector on settings page
The settings page SHALL include a language selector (All / DE / EN) that persists the user's language preference in localStorage. The selector SHALL appear as a segmented control above the sources list.

#### Scenario: Language selector rendering
- **WHEN** the settings page is displayed
- **THEN** a "Language" section with a segmented control (All / DE / EN) SHALL appear above the "Sources" section

#### Scenario: Language selection persists
- **WHEN** the user selects "DE" and navigates away from settings
- **THEN** the language preference SHALL be saved to localStorage and applied to the feed

### Requirement: Settings page structured layout
The settings page SHALL use a structured layout with clearly labeled sections, card-style grouping for sources, and visual dividers between sources. The layout SHALL include a page heading.

#### Scenario: Settings page rendering
- **WHEN** the user opens the settings page
- **THEN** the page SHALL display a "Settings" heading, a "Language" section with the segmented control, and a "Sources" section with each source in a card-like group separated by dividers

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
