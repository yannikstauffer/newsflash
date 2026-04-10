## Why

With the manifest and icons in place (from `pwa-manifest-and-icons`), the app is recognized as a PWA but can't be installed or work offline. A service worker is required for both. This step adds a Workbox-powered service worker via `vite-plugin-pwa` that precaches the app shell (HTML, JS, CSS, fonts), making the app installable and giving instant repeat-visit loading. Feed content is not cached yet — that comes in the next step.

## What Changes

- **Install `vite-plugin-pwa`** — Add the Vite plugin and configure it in `vite.config.ts` with `injectRegister: 'auto'`, `registerType: 'autoUpdate'`, and the manifest inline (or pointing to the existing `manifest.json`).
- **Precache Configuration** — Configure Workbox to precache the Vite build output: `index.html`, JS/CSS chunks, the Geist font files, and PWA icons. Use `workbox.globPatterns` to match `**/*.{js,css,html,svg,png,woff2}`.
- **Navigation Fallback** — Configure `navigateFallback` to `index.html` so all client-side routes work when loaded offline (the app shell renders, even if feed data isn't available yet).
- **Update Flow** — Use `autoUpdate` strategy: when a new service worker is detected, it activates immediately on the next navigation. No user prompt for updates at this stage.
- **Offline Fallback UI** — Add a minimal offline indicator component that detects `navigator.onLine` and shows a subtle banner ("You're offline — showing cached content") when the network is unavailable. This prepares the UX for Step 3.

## Capabilities

### New Capabilities

- `pwa-service-worker`: A Workbox service worker precaches the app shell, enabling installation and instant loading on repeat visits.
- `pwa-offline-indicator`: A network status indicator warns users when they're offline.

### Modified Capabilities

- `ui`: The app layout gains an offline status banner.

## Impact

- `package.json` — Add `vite-plugin-pwa` dependency
- `vite.config.ts` — Add VitePWA plugin configuration with precache settings and manifest
- `src/components/offline-banner.tsx` — New component: network status indicator
- `src/components/offline-banner.test.tsx` — Tests for offline banner
- `src/app/app-layout.tsx` — Include offline banner in the layout
- `index.html` — May remove static `<link rel="manifest">` if vite-plugin-pwa injects it
- Depends on: `pwa-manifest-and-icons` (needs icons and manifest to reference)
