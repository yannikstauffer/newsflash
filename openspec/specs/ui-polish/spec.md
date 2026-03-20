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
