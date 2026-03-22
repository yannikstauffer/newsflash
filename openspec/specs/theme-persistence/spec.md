## ADDED Requirements

### Requirement: Theme preference supports three modes
The system SHALL support three theme preference values: `"light"`, `"dark"`, and `"system"`. The `"system"` mode SHALL resolve to light or dark based on the operating system's `prefers-color-scheme` media query.

#### Scenario: System mode resolves to dark when OS prefers dark
- **WHEN** the theme preference is `"system"` and the OS color scheme is dark
- **THEN** the application SHALL apply the `dark` class to the document root element

#### Scenario: System mode resolves to light when OS prefers light
- **WHEN** the theme preference is `"system"` and the OS color scheme is light
- **THEN** the application SHALL NOT apply the `dark` class to the document root element

#### Scenario: Explicit light mode
- **WHEN** the theme preference is `"light"`
- **THEN** the application SHALL NOT apply the `dark` class regardless of OS preference

#### Scenario: Explicit dark mode
- **WHEN** the theme preference is `"dark"`
- **THEN** the application SHALL apply the `dark` class regardless of OS preference

### Requirement: System mode is the default
When no theme preference is stored in localStorage, the system SHALL behave as if `"system"` is selected.

#### Scenario: New user gets system theme
- **WHEN** a user opens the app for the first time (no `newsflash:theme` in localStorage)
- **THEN** the theme SHALL follow the OS color scheme preference

### Requirement: System mode tracks OS changes in real-time
When the preference is `"system"`, the application SHALL listen to `matchMedia("(prefers-color-scheme: dark)")` change events and update the applied theme immediately.

#### Scenario: OS switches from light to dark while app is open
- **WHEN** the preference is `"system"` and the OS switches from light to dark
- **THEN** the `dark` class SHALL be added to the document root element without page reload

#### Scenario: OS switches from dark to light while app is open
- **WHEN** the preference is `"system"` and the OS switches from dark to light
- **THEN** the `dark` class SHALL be removed from the document root element without page reload

#### Scenario: Listener is cleaned up when switching away from system
- **WHEN** the user changes preference from `"system"` to `"light"` or `"dark"`
- **THEN** the `matchMedia` change listener SHALL be removed

### Requirement: Theme persists across page reloads on all routes
The theme SHALL be applied on every page load regardless of which route the user is on. There SHALL be no flash of incorrect theme (FOUC).

#### Scenario: Reload on feed page with dark theme
- **WHEN** the user has dark theme selected and reloads the feed page (`/`)
- **THEN** the page SHALL render with the dark theme from the first paint

#### Scenario: Reload on read list page with dark theme
- **WHEN** the user has dark theme selected and reloads the read list page (`/read-list`)
- **THEN** the page SHALL render with the dark theme from the first paint

#### Scenario: Reload with system preference
- **WHEN** the user has system preference and reloads any page
- **THEN** the page SHALL render with the OS-resolved theme from the first paint

### Requirement: Theme preference persists in localStorage
The selected theme preference (`"light"`, `"dark"`, or `"system"`) SHALL be stored in localStorage under the key `newsflash:theme`.

#### Scenario: Preference survives browser restart
- **WHEN** the user selects `"dark"` and closes/reopens the browser
- **THEN** the theme SHALL be `"dark"` on next visit

#### Scenario: Existing users keep their preference
- **WHEN** a user previously stored `"dark"` or `"light"` in localStorage
- **THEN** that preference SHALL be preserved (no migration to `"system"`)
