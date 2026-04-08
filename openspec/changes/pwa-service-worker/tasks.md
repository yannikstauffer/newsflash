## 1. Install and Configure vite-plugin-pwa

- [ ] 1.1 Install `vite-plugin-pwa` as a dev dependency
- [ ] 1.2 Add `VitePWA` plugin to `vite.config.ts` with: `registerType: 'autoUpdate'`, `injectRegister: 'auto'`, `workbox.globPatterns: ['**/*.{js,css,html,svg,png,woff2}']`, `workbox.navigateFallback: 'index.html'`
- [ ] 1.3 Configure the manifest inline in the VitePWA config (referencing the icons and metadata from `pwa-manifest-and-icons`) or point to the existing `public/manifest.json`
- [ ] 1.4 Verify the build produces a service worker file in `dist/` by running `npm run build` and checking output

## 2. Offline Banner Component

- [ ] 2.1 Create `src/hooks/use-online-status.ts` — a hook that tracks `navigator.onLine` state and listens to `online`/`offline` window events
- [ ] 2.2 Create `src/hooks/use-online-status.test.ts` — tests: initial online state, transition to offline, transition back to online
- [ ] 2.3 Create `src/components/offline-banner.tsx` — renders a subtle banner with `role="status"` when offline; hidden when online. Uses Tailwind for styling, respects dark mode
- [ ] 2.4 Create `src/components/offline-banner.test.tsx` — tests: renders when offline, hidden when online, has correct ARIA role
- [ ] 2.5 Add `<OfflineBanner />` to `src/app/app-layout.tsx` above the main content area

## 3. Update index.html (if needed)

- [ ] 3.1 Remove static `<link rel="manifest">` if `vite-plugin-pwa` injects it automatically (avoid duplicate)
- [ ] 3.2 Verify the built `index.html` contains the manifest link and SW registration script

## 4. Quality Gates

- [ ] 4.1 Run `npm run lint` and fix any issues
- [ ] 4.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 4.3 Run `npm run test` and fix any issues
- [ ] 4.4 Run `npm run test:e2e` and fix any issues
- [ ] 4.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 4.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
