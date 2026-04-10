## Context

After `pwa-service-worker`, Newsflash is technically installable — Chrome on Android will show its default mini-infobar. However, the default prompt is easy to miss, appears at an unpredictable time, and iOS Safari doesn't support `beforeinstallprompt` at all (users must manually tap Share → Add to Home Screen). The app targets primarily mobile users, making a deliberate install experience important.

The current UI has a bottom navigation bar, a feed page (main), a read list page, and a settings page. The settings page (`feed-config-page.tsx`) contains feed toggles and filter toggles grouped in collapsible sections.

## Goals / Non-Goals

**Goals:**

- Capture the `beforeinstallprompt` event on supported browsers (Chrome Android)
- Show a custom install banner on the feed page for eligible mobile users
- Provide iOS-specific guidance (share → add to home screen)
- Add an "Install App" option in settings as an always-accessible install path
- Detect standalone mode to hide install UI when already installed
- Respect user dismissal (don't nag — 7-day cooldown after dismissal)

**Non-Goals:**

- Desktop install prompt (primarily mobile target)
- A/B testing install prompt timing
- Analytics on install conversion rates
- Custom splash screen beyond what the OS generates from the manifest

## Decisions

### `useInstallPrompt` hook captures and defers the browser event

A custom hook listens for `beforeinstallprompt`, calls `preventDefault()` on the event, and stores it in a ref. The hook exposes `canInstall: boolean` and `triggerInstall(): Promise<void>`. The dismissed state is tracked in localStorage (`newsflash:install-dismissed`) with a timestamp; the prompt reappears after 7 days.

Alternative considered: using a library like `@nicepkg/pwa-prompt`. Rejected because the logic is simple enough to implement directly and avoids a dependency.

### Install banner on feed page, not a modal or full-screen prompt

A bottom-anchored banner (above the nav bar) on the feed page. Non-blocking — the user can scroll and interact normally. Contains the app icon, a one-line message, an "Install" button, and a dismiss (X) button. Shown only on the feed page because that's where users spend most time.

Alternative considered: a modal dialog. Rejected because modals are intrusive and feel like ads. A subtle banner is more respectful and aligns with modern PWA UX guidelines.

Alternative considered: toast notification. Rejected because toasts auto-dismiss and the install prompt needs deliberate user interaction.

### iOS detection via user agent

iOS Safari doesn't fire `beforeinstallprompt`. The install banner detects iOS via `navigator.userAgent` (checking for `iPhone|iPad|iPod` and absence of `CriOS|FxiOS` to exclude Chrome/Firefox on iOS, which can't install PWAs anyway). On iOS Safari, the banner shows instructional text: "Tap Share, then 'Add to Home Screen'" with a share icon illustration.

Alternative considered: feature detection only (`'BeforeInstallPromptEvent' in window`). This works for detecting the Android path but doesn't distinguish iOS Safari (where we want to show guidance) from browsers that simply don't support install (where we should show nothing). User agent sniffing is the pragmatic choice.

### `useIsStandalone` hook via media query

A simple hook that checks `window.matchMedia('(display-mode: standalone)')` and listens for changes. Also checks the legacy `navigator.standalone` property for iOS. Returns a boolean. Used to hide install UI when the app is already running as a PWA.

### Settings page "Install App" row

Added to the settings page below the existing sections. Shows conditionally: visible when running in browser, hidden when running as installed PWA. On Android, triggers the deferred `beforeinstallprompt`. On iOS, shows the share instructions inline.

## Risks / Trade-offs

**[Risk] `beforeinstallprompt` not firing** → Chrome only fires this event when PWA criteria are met (manifest + service worker + HTTPS). If something breaks in Steps 1–2, the install prompt won't appear. The settings page install option provides a fallback discovery path.

**[Trade-off] User agent sniffing for iOS** → UA strings can change and are fragile. However, the consequence of a false negative is just not showing the iOS guidance — the app still works. A false positive shows unnecessary instructions. Both are low-impact.

**[Trade-off] 7-day dismissal cooldown is arbitrary** → Too short = nagging. Too long = missed opportunity. 7 days balances both. The settings page provides a persistent install path for users who change their mind.

**[Risk] Install banner layout clashes with bottom nav** → The banner sits above the bottom nav. On small screens, this reduces visible content area. The banner is kept to a single line (icon + text + button + dismiss) to minimize height impact.
