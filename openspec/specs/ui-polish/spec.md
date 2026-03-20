## ADDED Requirements

### Requirement: Consistent vertical spacing
The feed page SHALL use consistent vertical spacing between cards and between the filter bar and the first card. Card gap SHALL be uniform.

#### Scenario: Card list spacing
- **WHEN** the feed list renders multiple article cards
- **THEN** cards SHALL be separated by a consistent gap (e.g., 12px mobile, 16px desktop)

### Requirement: Card border and shadow styling
Article cards SHALL use a subtle border with a light shadow on hover instead of a plain border. The default state SHALL have a minimal border and no shadow.

#### Scenario: Card default state
- **WHEN** an article card is rendered in its default state
- **THEN** the card SHALL have a subtle border and no shadow

#### Scenario: Card hover state
- **WHEN** a user hovers over an article card
- **THEN** the card SHALL gain a subtle shadow with a smooth transition

### Requirement: Smooth transitions
All interactive elements (cards, buttons, filters) SHALL use CSS transitions for state changes (hover, active, focus). Transition duration SHALL be short (150-200ms) to feel responsive.

#### Scenario: Button state change
- **WHEN** a user hovers over a filter button
- **THEN** the visual change SHALL animate smoothly over 150-200ms

### Requirement: Typography consistency
The feed page SHALL use consistent font sizes and weights: card titles semibold at base size, metadata at small size with muted color, descriptions at small size with muted-foreground color.

#### Scenario: Font size hierarchy
- **WHEN** an article card is rendered
- **THEN** the title SHALL be `text-base font-semibold`, metadata SHALL be `text-xs text-muted-foreground`, and description SHALL be `text-sm text-muted-foreground`

### Requirement: Softened light theme colors
The light theme SHALL use softened colors instead of pure black/white extremes. The goal is a gentler, less harsh reading experience while staying in the grayscale family with no distinct accent color.

#### Scenario: Foreground text color
- **WHEN** the light theme is active
- **THEN** the `--foreground` color SHALL be a dark gray (not pure black), e.g., `oklch(0.25 0 0)` instead of `oklch(0.145 0 0)`

#### Scenario: Primary color
- **WHEN** the light theme is active
- **THEN** the `--primary` color SHALL be a dark gray (not pure black), e.g., `oklch(0.30 0 0)` instead of `oklch(0.205 0 0)`

#### Scenario: Page background
- **WHEN** the light theme is active
- **THEN** the page `--background` SHALL be a subtle off-white (e.g., `oklch(0.98 0 0)`) to reduce the "wall of white" feel

#### Scenario: Card background stays white
- **WHEN** article cards are rendered in the light theme
- **THEN** the `--card` color SHALL remain pure white (`oklch(1 0 0)`) so cards have a slight lift against the off-white page background

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
- **THEN** the app SHALL use the light theme (not follow system preference, to keep behavior predictable)
