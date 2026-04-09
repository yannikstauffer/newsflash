## Context

After `pwa-manifest-and-icons`, the app has a web app manifest, icon set, and Apple meta tags. However, without a service worker, the app cannot be installed and has no offline capability. The app is built with Vite 8, which has excellent support for `vite-plugin-pwa` — a mature plugin that wraps Workbox for service worker generation, precaching, and runtime caching.

The current `vite.config.ts` uses `@vitejs/plugin-react` and `@tailwindcss/vite`, with a custom proxy config for RSS feeds. The build output goes to `dist/`.

## Goals / Non-Goals

**Goals:**

- Make the app installable by registering a service worker
- Precache the app shell (HTML, JS, CSS, fonts, icons) for instant repeat-visit loading
- Configure navigation fallback so client-side routing works offline
- Add a minimal offline status indicator to prepare for Step 3's offline content
- Use `autoUpdate` strategy for seamless service worker updates

**Non-Goals:**

- Runtime caching for feed API responses or images — that's Step 3
- Custom install prompt UX — that's Step 4
- Offline feed content display — that's Step 3
- Custom service worker logic (periodic sync, etc.) — that's Step 5

## Decisions

### `vite-plugin-pwa` with `generateSW` strategy

Using `vite-plugin-pwa` in `generateSW` mode (default). This auto-generates a Workbox service worker from configuration, handling precaching and navigation fallback without writing any service worker code. Step 5 will switch to `injectManifest` mode when custom SW logic is needed, but for Steps 2–4, `generateSW` is simpler and sufficient.

Alternative considered: writing a custom service worker from scratch. Rejected because Workbox's `generateSW` handles precaching, cache versioning, and update lifecycle correctly — reimplementing this is error-prone.

Alternative considered: `injectManifest` mode from the start. Rejected as premature — we don't need custom SW logic until Step 5. Starting with `generateSW` keeps things simple and the migration to `injectManifest` in Step 5 is straightforward.

### `registerType: 'autoUpdate'` with no user prompt

New service worker versions activate immediately on the next navigation without prompting the user. For a news reader, users should always get the latest version without friction. There's no risk of breaking in-progress work (unlike a document editor).

Alternative considered: `registerType: 'prompt'` with an "Update available" toast. Rejected because it adds UI complexity and user friction with no real benefit for this app type. Can be reconsidered later if updates cause visible disruption.

### `injectRegister: 'auto'`

Let the plugin automatically inject the service worker registration script into the HTML. This avoids manual registration code in `main.tsx` and keeps the setup contained in `vite.config.ts`.

Alternative considered: manual registration in `main.tsx` via `registerSW` from `virtual:pwa-register`. Rejected for Step 2 because auto-injection is simpler. Step 5 may revisit if we need programmatic control over registration timing.

### Offline banner as a simple `navigator.onLine` listener

A lightweight component that listens to `online`/`offline` window events and shows a dismissible banner. No complex state management — just a boolean state. Placed in `app-layout.tsx` above the main content.

Alternative considered: using the `workbox-window` library's `offline`/`online` events. Rejected because `navigator.onLine` + window events are sufficient and avoid adding another dependency. Workbox-window's events are essentially wrappers around the same browser APIs.

### Precache glob patterns

`**/*.{js,css,html,svg,png,woff2}` covers the Vite build output: hashed JS/CSS chunks, `index.html`, SVG icons, PNG icons, and Geist font files. The `workbox.globPatterns` config is set on the VitePWA plugin.

## Risks / Trade-offs

**[Risk] Service worker caches stale HTML** → The `autoUpdate` strategy mitigates this: new SW versions are detected on navigation and activate immediately. The precached `index.html` is always replaced by the latest build's version.

**[Trade-off] `generateSW` limits custom SW logic** → Step 5 requires periodic sync handlers, which need `injectManifest`. This means a migration in Step 5. The cost is small (config change + moving runtime caching config into a SW source file) and the simplicity benefit of `generateSW` for Steps 2–4 outweighs it.

**[Risk] Large precache payload on first visit** → The full app shell (JS, CSS, fonts, icons) may be 500KB–1MB. This is a one-time cost on first visit; subsequent visits load from cache. For a news reader opened daily, this is acceptable.

**[Trade-off] `navigator.onLine` can be unreliable** → It returns `true` when connected to a network but the network has no internet. The offline banner may not appear in all offline scenarios. This is acceptable for a subtle informational banner — Step 3's offline caching strategy handles the actual data resilience.
