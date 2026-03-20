## ADDED Requirements

### Requirement: Softened light theme colors
The light theme SHALL use softened colors instead of pure black/white extremes. The goal is a gentler, less harsh reading experience while staying in the grayscale family with no distinct accent color.

#### Scenario: Foreground text color
- **WHEN** the light theme is active
- **THEN** the `--foreground` color SHALL be a dark gray (not pure black), approximately `oklch(0.25 0 0)`

#### Scenario: Primary color
- **WHEN** the light theme is active
- **THEN** the `--primary` color SHALL be a dark gray (not pure black), approximately `oklch(0.30 0 0)`

#### Scenario: Page background
- **WHEN** the light theme is active
- **THEN** the page `--background` SHALL be a subtle off-white, approximately `oklch(0.98 0 0)`

#### Scenario: Card background stays white
- **WHEN** article cards are rendered in the light theme
- **THEN** the `--card` color SHALL remain pure white (`oklch(1 0 0)`) so cards have visual lift against the off-white page background

#### Scenario: Border softness
- **WHEN** the light theme is active
- **THEN** border colors SHALL be softened to match the gentler overall palette

### Requirement: Dark mode toggle in settings
The settings page SHALL include a dark mode toggle that allows the user to switch between light and dark themes. The preference SHALL be persisted in localStorage.

#### Scenario: Dark mode toggle rendering
- **WHEN** the settings page is displayed
- **THEN** an "Appearance" section SHALL appear with a segmented control for Light / Dark

#### Scenario: Activating dark mode
- **WHEN** the user selects Dark via the toggle
- **THEN** the `.dark` class SHALL be applied to the document and the dark theme colors SHALL take effect immediately

#### Scenario: Dark mode persists across sessions
- **WHEN** the user sets dark mode and refreshes or reopens the page
- **THEN** the dark mode preference SHALL be restored from localStorage

#### Scenario: Default theme
- **WHEN** no preference is stored in localStorage
- **THEN** the app SHALL use the light theme
