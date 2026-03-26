## Requirements

### Requirement: Fixed-height title+description container on desktop

On `md:` breakpoint and above, the title and description SHALL be wrapped in a flex-column container with a fixed height of `92px`. The title SHALL be `flex-none` (taking its natural height). The description SHALL be `flex-1` with `overflow-hidden`.

#### Scenario: Two-line title with description

- **WHEN** an article card is rendered on desktop with a title that wraps to 2 lines
- **THEN** the description SHALL be visible for approximately 2 lines (40px available: 92px - 48px title - 4px gap)

#### Scenario: One-line title with description

- **WHEN** an article card is rendered on desktop with a title that fits on 1 line
- **THEN** the description SHALL be visible for approximately 3 lines (64px available: 92px - 24px title - 4px gap), with any partial overflow masked by the gradient fade

#### Scenario: No description

- **WHEN** an article card is rendered on desktop with no description text
- **THEN** the fixed-height container SHALL still apply, with the title taking its natural height and remaining space empty

#### Scenario: Cards without images

- **WHEN** an article card without an image is rendered on desktop
- **THEN** the same fixed-height title+description container and gradient fade behavior SHALL apply

### Requirement: Gradient fade on description overflow

The description paragraph SHALL use a CSS `mask-image` to create a gradient fade at the bottom, smoothly dissolving any partially visible lines instead of a hard cutoff.

#### Scenario: Description overflows available space

- **WHEN** the description text exceeds the available height in the flex container
- **THEN** the bottom ~12px (`0.75rem`) of the description area SHALL fade from fully visible to transparent via `mask-image: linear-gradient(to bottom, black calc(100% - 0.75rem), transparent)`

#### Scenario: Description fits within available space

- **WHEN** the description text fits entirely within the available height
- **THEN** the gradient fade SHALL still be present but have no visible effect (all text is above the fade zone)

### Requirement: Title clamping unchanged

The title SHALL retain its existing `md:line-clamp-2` behavior on desktop and `line-clamp-4` on mobile. This change does not modify title truncation.

### Requirement: Mobile layout unchanged

On viewports below `md:` breakpoint, the card SHALL retain its current layout: title with `line-clamp-4`, description hidden. The fixed-height container and gradient fade SHALL NOT apply on mobile.

## Height Calculation Reference

```
text-base (title):  16px font, 24px line-height
text-sm (desc):     14px font, 20px line-height
mb-1 (gap):         4px

Container height = 92px

2-line title: 48px + 4px gap = 52px used → 40px for desc = 2.0 lines
1-line title: 24px + 4px gap = 28px used → 64px for desc = 3.2 lines (gradient fades partial)
```
