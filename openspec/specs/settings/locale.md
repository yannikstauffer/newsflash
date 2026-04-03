# App Locale Setting

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

---

# i18n Infrastructure

## Requirements

### Requirement: i18next initialization with locale detection
The application SHALL initialize i18next at startup with the detection order: localStorage (`newsflash:locale`) -> `navigator.language` -> `"en"` fallback. Only `"de"` and `"en"` are supported locales.

#### Scenario: User has saved locale in localStorage
- **WHEN** `localStorage("newsflash:locale")` is `"de"`
- **THEN** the app SHALL render in German

#### Scenario: No saved locale, browser is German
- **WHEN** no localStorage locale exists AND `navigator.language` is `"de-CH"`
- **THEN** the app SHALL render in German (region code stripped to base language)

#### Scenario: No saved locale, browser is English
- **WHEN** no localStorage locale exists AND `navigator.language` is `"en-US"`
- **THEN** the app SHALL render in English

#### Scenario: Unsupported browser language
- **WHEN** no localStorage locale exists AND `navigator.language` is `"fr"`
- **THEN** the app SHALL fall back to English

### Requirement: Translation files with nested keys
The application SHALL load translations from `src/locales/en.json` and `src/locales/de.json`. Keys SHALL be nested by feature area (e.g., `feed.empty`, `settings.heading`, `nav.feed`).

#### Scenario: All UI strings are translated
- **WHEN** the app renders in any supported locale
- **THEN** all user-facing strings (navigation labels, button text, headings, empty states, error messages, aria-labels, placeholders) SHALL display in the active locale

#### Scenario: Missing translation key
- **WHEN** a translation key is missing in the active locale
- **THEN** the English translation SHALL be used as fallback

### Requirement: Locale-aware date and time formatting
All date and time displays SHALL use `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` with the active locale.

#### Scenario: Relative time in German
- **WHEN** the locale is `"de"` AND an article was published 3 hours ago
- **THEN** the relative time SHALL display in German (e.g., "vor 3 Stunden")

#### Scenario: Relative time in English
- **WHEN** the locale is `"en"` AND an article was published 3 hours ago
- **THEN** the relative time SHALL display as "3 hours ago"

#### Scenario: Day label in German
- **WHEN** the locale is `"de"` AND the date is today
- **THEN** the day label SHALL display as "heute, 21.03.2026" (German date format)

#### Scenario: Day label in English
- **WHEN** the locale is `"en"` AND the date is today
- **THEN** the day label SHALL display as "today, 3/21/2026" (English date format)

#### Scenario: Absolute time respects locale
- **WHEN** the locale is `"en"`
- **THEN** absolute timestamps SHALL use locale-appropriate formatting via `Intl.DateTimeFormat`

### Requirement: ESLint enforcement of translated strings
The `i18next/no-literal-string` ESLint rule SHALL be set to `"warn"` to catch untranslated user-facing strings at lint time.

#### Scenario: Untranslated string triggers warning
- **WHEN** a developer adds a hardcoded user-facing string in a component
- **THEN** ESLint SHALL report a warning for `i18next/no-literal-string`

#### Scenario: Non-user-facing strings are ignored
- **WHEN** a string is used in a non-user-facing attribute (e.g., `role`, `data-testid`, `className`)
- **THEN** ESLint SHALL NOT report a warning
