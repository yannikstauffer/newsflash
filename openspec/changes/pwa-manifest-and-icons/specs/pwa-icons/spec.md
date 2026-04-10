## ADDED Requirements

### Requirement: PWA icon set covers all required sizes

The app SHALL provide PNG icons in `public/icons/` for all standard PWA sizes, ensuring sharp rendering on all device densities and contexts.

#### Scenario: All standard sizes exist

- **WHEN** the `public/icons/` directory is listed
- **THEN** it SHALL contain PNG files for: 48x48, 72x72, 96x96, 128x128, 144x144, 192x192, 384x384, 512x512

#### Scenario: Maskable icon exists with safe zone

- **WHEN** the maskable icon (512x512) is examined
- **THEN** the foreground content (lightning bolt) SHALL be contained within the inner 80% safe zone circle, with the brand background filling the entire canvas

#### Scenario: Apple touch icon exists

- **WHEN** the `public/icons/` directory is listed
- **THEN** it SHALL contain `apple-touch-icon-180.png` at 180x180 pixels

### Requirement: Icon design conveys the Newsflash brand

All icons SHALL use a consistent design: a bold white lightning bolt on a blue (`#2563eb`) background. The design SHALL be recognizable at the smallest size (48x48).

#### Scenario: Visual consistency across sizes

- **WHEN** any two icons from the set are compared
- **THEN** they SHALL use the same color scheme, bolt shape, and proportions (scaled to size)

### Requirement: Favicon updated to match icon design

The favicon SHALL be updated to match the new PWA icon design, with both SVG and PNG formats available.

#### Scenario: SVG favicon

- **WHEN** the browser supports SVG favicons
- **THEN** it SHALL load `favicon.svg` showing the lightning bolt design

#### Scenario: PNG favicon fallback

- **WHEN** the browser does not support SVG favicons
- **THEN** it SHALL fall back to `favicon-32.png` (32x32) via a `<link rel="icon" type="image/png">` tag
