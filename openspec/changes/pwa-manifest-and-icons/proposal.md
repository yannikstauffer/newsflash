## Why

Newsflash is a mobile-first news reader that users visit daily, but it currently has no PWA foundation — no manifest, no icons, no metadata. Without these, browsers can't offer "Add to Home Screen", the app has no identity when launched standalone, and it looks unprofessional in app switchers. The web app manifest and icon set are prerequisites for every other PWA feature (service worker, offline, install prompt).

## What Changes

- **Web App Manifest** — Create `public/manifest.json` with app name ("Newsflash"), short name, theme color, background color, `display: standalone`, `orientation: portrait`, start URL `/`, and scope `/`. Language set to `en`.
- **PWA Icon Set** — Design a simple, recognizable app icon (lightning bolt / news motif) and generate the required sizes: 48x48, 72x72, 96x96, 128x128, 144x144, 192x192, 384x384, 512x512. Include a maskable variant (512x512 with safe zone padding) for Android adaptive icons. Place all icons in `public/icons/`.
- **Apple Meta Tags** — Add `<meta name="apple-mobile-web-app-capable">`, `<meta name="apple-mobile-web-app-status-bar-style">`, `<link rel="apple-touch-icon">` (180x180) to `index.html`.
- **General Meta Tags** — Add `<meta name="theme-color">` (with media queries for dark/light), `<meta name="description">`, and `<link rel="manifest">` to `index.html`.
- **Favicon Update** — Replace the current `favicon.svg` with the new icon design, keeping SVG for modern browsers and adding a 32x32 PNG fallback.

## Capabilities

### New Capabilities

- `pwa-manifest`: The app declares itself as a Progressive Web App via a W3C web app manifest, enabling browser recognition and future installability.
- `pwa-icons`: The app provides a complete icon set for home screen, app switcher, splash screen, and maskable contexts across Android and iOS.

### Modified Capabilities

- `ui`: The `index.html` entry point gains PWA meta tags, Apple web app tags, and theme-color declarations that respect the existing dark/light mode.

## Impact

- `public/manifest.json` — New file: web app manifest
- `public/icons/` — New directory: PNG icon set (8 standard sizes + 1 maskable + 1 apple-touch-icon)
- `public/favicon.svg` — Redesigned to match the new icon identity
- `public/favicon-32.png` — New file: PNG fallback favicon
- `index.html` — Add `<link rel="manifest">`, Apple meta tags, theme-color meta tags, description meta tag, PNG favicon link
- No runtime code changes — this is purely static assets and HTML metadata
- Depends on: nothing (this is the foundation)
