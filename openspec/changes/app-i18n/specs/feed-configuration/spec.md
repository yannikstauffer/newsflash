## MODIFIED Requirements

### Requirement: Language selector on settings page
The settings page language selector SHALL be repurposed from a feed language filter to an app locale selector.

#### Scenario: Language selector rendering
- **WHEN** the settings page is displayed
- **THEN** a language section with two options ("Deutsch", "English") SHALL appear above the "Sources" section

#### Scenario: Language selection changes app locale
- **WHEN** the user selects "Deutsch"
- **THEN** the app UI SHALL switch to German AND the preference SHALL be saved to `localStorage("newsflash:locale")`

## REMOVED Requirements

### ~~Requirement: Language selector uses feed preferences storage~~
The language preference is no longer stored in the `newsflash:feed-prefs` localStorage entry under `_language`. It is now stored separately in `newsflash:locale` and controls the app locale rather than feed filtering.
