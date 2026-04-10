## Why

After Steps 1–3, Newsflash is technically installable, but the browser's default install prompt is easy to miss (especially on iOS where there's no prompt at all). A deliberate install experience increases adoption — guiding mobile users to add the app to their home screen where it behaves like a native app. This step adds a custom install prompt for Android/Chrome and iOS-specific guidance.

## What Changes

- **Capture `beforeinstallprompt`** — Create a `useInstallPrompt` hook that listens for the `beforeinstallprompt` event, stores the deferred prompt, and exposes `canInstall` and `triggerInstall()`. The hook tracks whether the user has dismissed the prompt (persisted in localStorage) to avoid nagging.
- **Install Banner Component** — A dismissible banner shown at the bottom of the feed page (mobile only) when `canInstall` is true and the user hasn't dismissed it in the last 7 days. Shows the app icon, "Install Newsflash" text, and an "Install" button. Respects the existing design system (shadcn/ui patterns, Tailwind).
- **iOS Install Guidance** — On iOS Safari (detected via user agent), show a different banner with instructions: "Tap the share button, then 'Add to Home Screen'". iOS doesn't support `beforeinstallprompt`, so this is a static instructional prompt.
- **Settings Page Install Option** — Add an "Install App" row in the settings page that triggers the install prompt (Android) or shows the iOS instructions. Always visible when the app is running in the browser (hidden when running as installed PWA via `display-mode: standalone` media query).
- **Standalone Detection** — Create a `useIsStandalone` hook that checks `window.matchMedia('(display-mode: standalone)')` and the iOS `navigator.standalone` flag. Used to hide install UI when already installed.

## Capabilities

### New Capabilities

- `pwa-install-prompt`: Custom install experience with platform-aware prompts for Android and iOS, respecting user dismissal preferences.
- `pwa-standalone-detection`: Utility hook to detect whether the app is running as an installed PWA.

### Modified Capabilities

- `settings`: The settings page gains an "Install App" option.
- `ui`: The feed page conditionally shows an install banner for eligible mobile users.

## Impact

- `src/hooks/use-install-prompt.ts` — New hook: captures `beforeinstallprompt`, exposes install API
- `src/hooks/use-install-prompt.test.ts` — Tests for install prompt hook
- `src/hooks/use-is-standalone.ts` — New hook: detects standalone/installed mode
- `src/hooks/use-is-standalone.test.ts` — Tests for standalone detection
- `src/components/install-banner.tsx` — New component: dismissible install prompt (Android + iOS variants)
- `src/components/install-banner.test.tsx` — Tests for install banner
- `src/features/feed-config/components/feed-config-page.tsx` — Add "Install App" row
- `src/features/feed/components/feed-page.tsx` — Include install banner
- Depends on: `pwa-service-worker` (app must be installable for the prompt to fire)
