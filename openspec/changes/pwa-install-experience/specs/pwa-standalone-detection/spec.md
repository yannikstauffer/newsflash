## ADDED Requirements

### Requirement: Standalone mode detection

The app SHALL detect whether it is running as an installed PWA (standalone mode) or in a browser tab.

#### Scenario: Installed PWA detected via media query

- **WHEN** the app is launched from the home screen
- **THEN** `window.matchMedia('(display-mode: standalone)')` SHALL match and `useIsStandalone` SHALL return `true`

#### Scenario: iOS standalone detected

- **WHEN** the app is launched from the iOS home screen
- **THEN** `navigator.standalone` SHALL be `true` and `useIsStandalone` SHALL return `true`

#### Scenario: Browser tab detected

- **WHEN** the app is opened in a normal browser tab
- **THEN** `useIsStandalone` SHALL return `false`

#### Scenario: Dynamic detection on change

- **WHEN** the display mode changes (e.g., browser adds/removes standalone mode support)
- **THEN** `useIsStandalone` SHALL update reactively via the media query listener
