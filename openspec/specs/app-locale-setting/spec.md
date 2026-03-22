## Requirements

### Requirement: App language selector on settings page
The settings page SHALL display a language selector with two options: "Deutsch" and "English". The labels SHALL always display in their native language regardless of the active locale.

#### Scenario: Settings page shows language selector
- **WHEN** the user opens the settings page
- **THEN** a language section SHALL display with "Deutsch" and "English" as selectable options

#### Scenario: Active language is visually indicated
- **WHEN** the current app locale is `"de"`
- **THEN** the "Deutsch" option SHALL be visually highlighted as active

### Requirement: Language selection changes app locale
Selecting a language SHALL immediately switch the entire app UI to that language by calling `i18next.changeLanguage()`.

#### Scenario: Switch to German
- **WHEN** the user selects "Deutsch"
- **THEN** all UI strings, date/time formatting, and aria-labels SHALL render in German

#### Scenario: Switch to English
- **WHEN** the user selects "English"
- **THEN** all UI strings, date/time formatting, and aria-labels SHALL render in English

### Requirement: Language selection persists
The selected language SHALL be persisted to `localStorage("newsflash:locale")` and restored on next app load.

#### Scenario: Language persists across sessions
- **WHEN** the user selects "Deutsch" and reloads the page
- **THEN** the app SHALL load in German

### Requirement: Language selector is accessible
The language selector SHALL use `role="radiogroup"` with an appropriate `aria-label` in the active locale. Each option SHALL be a button with `role="radio"` and `aria-checked` state.

#### Scenario: Screen reader announces language selector
- **WHEN** a screen reader user navigates to the language selector
- **THEN** the group label and individual options SHALL be announced with their checked state
