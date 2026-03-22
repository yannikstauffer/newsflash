## ADDED Requirements

### Requirement: Mobile title line clamp relaxed to 4 lines
On viewports below the `md` breakpoint, the article card title SHALL be clamped to a maximum of 4 lines (`line-clamp-4`). On `md` and above, the title SHALL remain clamped to 2 lines (`line-clamp-2`).

#### Scenario: Title with 3 lines of text on mobile
- **WHEN** an article title wraps to 3 lines on a mobile viewport
- **THEN** the full title text SHALL be visible without truncation

#### Scenario: Title with 5 lines of text on mobile
- **WHEN** an article title would wrap to 5 lines on a mobile viewport
- **THEN** the title SHALL be clamped at 4 lines with ellipsis

#### Scenario: Title on desktop viewport
- **WHEN** an article title is displayed on a viewport at `md` breakpoint or above
- **THEN** the title SHALL be clamped to 2 lines with ellipsis (unchanged behavior)

### Requirement: Mobile title uses medium font weight
On viewports below the `md` breakpoint, the article card title SHALL use `font-medium` (weight 500). On `md` and above, the title SHALL use `font-semibold` (weight 600).

#### Scenario: Title weight on mobile
- **WHEN** an article card is rendered on a mobile viewport
- **THEN** the title SHALL have font-weight 500 (`font-medium`)

#### Scenario: Title weight on desktop
- **WHEN** an article card is rendered on a viewport at `md` breakpoint or above
- **THEN** the title SHALL have font-weight 600 (`font-semibold`)

### Requirement: Description hidden on mobile
The article description paragraph SHALL NOT be rendered on viewports below the `md` breakpoint. On `md` and above, the description SHALL be displayed with `line-clamp-2` (unchanged).

#### Scenario: Article with description on mobile
- **WHEN** an article has a description and is viewed on a mobile viewport
- **THEN** the description paragraph SHALL be hidden

#### Scenario: Article with description on desktop
- **WHEN** an article has a description and is viewed on a viewport at `md` breakpoint or above
- **THEN** the description SHALL be visible, clamped to 2 lines

### Requirement: Uniform 96x96 square thumbnail
The article card thumbnail SHALL be 96x96 pixels (`size-24`) on all viewports. The HTML `width` and `height` attributes SHALL both be set to `96`.

#### Scenario: Thumbnail on mobile
- **WHEN** an article with an image is rendered on a mobile viewport
- **THEN** the thumbnail SHALL display at 96x96 pixels

#### Scenario: Thumbnail on desktop
- **WHEN** an article with an image is rendered on a desktop viewport
- **THEN** the thumbnail SHALL display at 96x96 pixels
