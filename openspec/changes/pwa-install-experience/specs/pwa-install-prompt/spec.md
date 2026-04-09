## ADDED Requirements

### Requirement: Custom install prompt captures browser event

The app SHALL capture the `beforeinstallprompt` event and defer it, allowing a custom UI to trigger the install at the user's convenience.

#### Scenario: beforeinstallprompt is captured on Android Chrome

- **WHEN** the browser fires `beforeinstallprompt` (PWA criteria met)
- **THEN** the app SHALL prevent the default mini-infobar and store the event for later use
- **AND** `canInstall` SHALL become `true`

#### Scenario: Install triggered by user action

- **WHEN** the user taps the "Install" button
- **THEN** the app SHALL call `prompt()` on the deferred event and the browser's native install dialog SHALL appear

#### Scenario: User accepts install

- **WHEN** the user accepts the browser's install dialog
- **THEN** the deferred prompt SHALL be cleared and the install banner SHALL be hidden

#### Scenario: User dismisses install dialog

- **WHEN** the user dismisses the browser's install dialog
- **THEN** the install banner SHALL remain visible (dismissal of the browser dialog is not the same as dismissing the app's banner)

### Requirement: Install banner shown on feed page for eligible mobile users

A non-blocking install banner SHALL appear on the feed page when the app is installable and the user has not recently dismissed it.

#### Scenario: Banner shown when installable

- **WHEN** `canInstall` is `true` and the user has not dismissed the banner in the last 7 days
- **THEN** the install banner SHALL be visible on the feed page

#### Scenario: Banner not shown after dismissal

- **WHEN** the user dismisses the install banner
- **THEN** the banner SHALL not appear again for 7 days (timestamp stored in localStorage)

#### Scenario: Banner not shown when already installed

- **WHEN** the app is running in standalone mode (installed PWA)
- **THEN** the install banner SHALL not be rendered

### Requirement: iOS install guidance

On iOS Safari, the app SHALL show platform-specific install instructions since `beforeinstallprompt` is not supported.

#### Scenario: iOS Safari shows share instructions

- **WHEN** the user is on iOS Safari and the app is not installed
- **THEN** the install banner SHALL show instructional text: "Tap Share, then 'Add to Home Screen'"

#### Scenario: Non-Safari iOS browsers show nothing

- **WHEN** the user is on Chrome or Firefox on iOS
- **THEN** no install banner SHALL be shown (these browsers cannot install PWAs on iOS)

### Requirement: Settings page install option

The settings page SHALL include an "Install App" option that provides an always-accessible path to installation.

#### Scenario: Install option visible in browser

- **WHEN** the user opens the settings page in a browser (not standalone)
- **THEN** an "Install App" row SHALL be visible

#### Scenario: Install option hidden when installed

- **WHEN** the user opens the settings page as an installed PWA
- **THEN** the "Install App" row SHALL not be visible

#### Scenario: Tapping install on Android

- **WHEN** the user taps "Install App" on Android Chrome and `beforeinstallprompt` was captured
- **THEN** the browser's native install dialog SHALL appear

#### Scenario: Tapping install on iOS

- **WHEN** the user taps "Install App" on iOS Safari
- **THEN** the share instructions SHALL be displayed inline

### Requirement: Install UI is accessible

All install-related UI SHALL meet WCAG 2.1 Level AA requirements.

#### Scenario: Banner keyboard accessible

- **WHEN** the install banner is visible
- **THEN** the "Install" button and dismiss button SHALL be focusable and activatable via keyboard

#### Scenario: Banner dismiss has accessible label

- **WHEN** the dismiss button is rendered
- **THEN** it SHALL have an accessible label (e.g., `aria-label="Dismiss install prompt"`)
