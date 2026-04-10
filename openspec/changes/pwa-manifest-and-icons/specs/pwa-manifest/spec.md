## ADDED Requirements

### Requirement: Web app manifest declares PWA identity

The app SHALL provide a web app manifest at `/manifest.json` containing all required fields for PWA recognition by browsers and operating systems.

#### Scenario: Manifest contains required fields

- **WHEN** the browser fetches `/manifest.json`
- **THEN** the response SHALL be valid JSON containing: `name` ("Newsflash"), `short_name` ("Newsflash"), `description`, `start_url` ("/"), `scope` ("/"), `display` ("standalone"), `orientation` ("portrait"), `background_color`, `theme_color`, and an `icons` array

#### Scenario: Manifest is linked from HTML

- **WHEN** the browser parses `index.html`
- **THEN** it SHALL find a `<link rel="manifest" href="/manifest.json">` tag in the `<head>`

### Requirement: Manifest icon entries reference all required sizes

The manifest `icons` array SHALL include entries for standard PWA icon sizes with appropriate `purpose` declarations.

#### Scenario: Standard icon sizes are present

- **WHEN** the manifest `icons` array is read
- **THEN** it SHALL contain entries for sizes: 48x48, 72x72, 96x96, 128x128, 144x144, 192x192, 384x384, and 512x512 with `purpose: "any"`

#### Scenario: Maskable icon is present

- **WHEN** the manifest `icons` array is read
- **THEN** it SHALL contain at least one entry with `purpose: "maskable"` at size 512x512

### Requirement: Theme color respects dark/light mode

The HTML SHALL declare theme colors for both light and dark color schemes so the browser chrome matches the app's active theme.

#### Scenario: Light mode theme color

- **WHEN** the user's system or app preference is light mode
- **THEN** the browser SHALL use `#ffffff` as the theme color (via `<meta name="theme-color" media="(prefers-color-scheme: light)">`)

#### Scenario: Dark mode theme color

- **WHEN** the user's system or app preference is dark mode
- **THEN** the browser SHALL use `#0a0a0a` as the theme color (via `<meta name="theme-color" media="(prefers-color-scheme: dark)">`)

### Requirement: Apple-specific meta tags enable iOS web app behavior

The HTML SHALL include Apple-specific meta tags so the app works correctly when added to an iOS home screen.

#### Scenario: Apple mobile web app capable

- **WHEN** `index.html` is parsed on iOS Safari
- **THEN** it SHALL contain `<meta name="apple-mobile-web-app-capable" content="yes">`

#### Scenario: Apple status bar style

- **WHEN** the app is launched from the iOS home screen
- **THEN** the status bar SHALL use `default` style (via `<meta name="apple-mobile-web-app-status-bar-style" content="default">`)

#### Scenario: Apple touch icon

- **WHEN** iOS Safari reads the page for "Add to Home Screen"
- **THEN** it SHALL find a `<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">` referencing a 180x180 icon
