## ADDED Requirements

### Requirement: Service worker precaches the app shell

A Workbox-generated service worker SHALL precache all static assets produced by the Vite build, including HTML, JavaScript, CSS, fonts, SVG, and PNG files. This enables the app shell to load instantly on repeat visits without network requests.

#### Scenario: Repeat visit loads from precache

- **WHEN** the user visits the app for a second time after the service worker has installed
- **THEN** the app shell (HTML, JS, CSS, fonts) SHALL load from the precache without network requests

#### Scenario: First visit installs service worker and precaches

- **WHEN** the user visits the app for the first time
- **THEN** the service worker SHALL install and precache all static assets in the background

### Requirement: Navigation fallback serves index.html for client-side routes

The service worker SHALL respond to navigation requests (HTML requests for routes like `/`, `/read-list`, `/settings`) with the precached `index.html`. This ensures client-side routing works even when offline or when the server doesn't handle those routes.

#### Scenario: Direct navigation to /read-list offline

- **WHEN** the user navigates directly to `/read-list` while offline
- **THEN** the service worker SHALL serve the precached `index.html` and TanStack Router SHALL render the read list page

#### Scenario: Deep link to /settings

- **WHEN** the user opens a deep link to `/settings` on a repeat visit
- **THEN** the service worker SHALL serve `index.html` from precache and the client-side router SHALL handle the route

### Requirement: Service worker auto-updates without user prompt

When a new version of the service worker is detected (after a new build deployment), the new version SHALL activate automatically on the next navigation without requiring user interaction.

#### Scenario: New deployment triggers update

- **WHEN** the user navigates to the app after a new deployment
- **THEN** the browser SHALL detect the updated service worker, install it, and activate it automatically
- **AND** the next navigation SHALL use the new precached assets

#### Scenario: No update prompt shown

- **WHEN** a service worker update is detected
- **THEN** no toast, banner, or modal SHALL be shown to the user — the update happens silently

### Requirement: Service worker registration uses auto-inject

The service worker registration script SHALL be automatically injected into the HTML by `vite-plugin-pwa`. No manual registration code SHALL be added to `main.tsx` or other application files.

#### Scenario: No manual registration code

- **WHEN** the source code is searched for `navigator.serviceWorker.register`
- **THEN** no application source file SHALL contain manual service worker registration — the plugin handles injection
