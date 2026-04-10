## 1. Standalone Detection Hook

- [x] 1.1 Create `src/hooks/use-is-standalone.ts` — checks `matchMedia('(display-mode: standalone)')` and `navigator.standalone`, listens for changes, returns `boolean`
- [x] 1.2 Create `src/hooks/use-is-standalone.test.ts` — tests: standalone via media query, standalone via navigator.standalone (iOS), browser tab returns false

## 2. Install Prompt Hook

- [x] 2.1 Create `src/hooks/use-install-prompt.ts` — listens for `beforeinstallprompt`, stores deferred event in ref, exposes `canInstall`, `triggerInstall()`, tracks dismissal in localStorage (`newsflash:install-dismissed`) with 7-day cooldown
- [x] 2.2 Create `src/hooks/use-install-prompt.test.ts` — tests: captures event and sets canInstall, triggerInstall calls prompt(), dismissal persists to localStorage, 7-day cooldown logic, returns canInstall=false when standalone

## 3. Install Banner Component

- [x] 3.1 Create `src/components/install-banner.tsx` — renders bottom-anchored banner with app icon, message, "Install" button, dismiss button; two variants: Android (install button) and iOS Safari (share instructions); hidden when standalone or dismissed; accessible (keyboard, aria-label on dismiss)
- [x] 3.2 Create `src/components/install-banner.test.tsx` — tests: renders on Android when canInstall, renders iOS guidance on Safari, hidden when standalone, hidden after dismiss, accessible dismiss button
- [x] 3.3 Add `<InstallBanner />` to `src/features/feed/components/feed-page.tsx`

## 4. Settings Page Install Option

- [x] 4.1 Add an "Install App" section to `src/features/feed-config/components/feed-config-page.tsx` — shown only when not standalone; triggers install prompt on Android, shows iOS instructions on Safari
- [x] 4.2 Update `src/features/feed-config/components/feed-config-page.test.tsx` — tests: install option visible when not standalone, hidden when standalone, triggers prompt on click

## 5. Quality Gates

- [x] 5.1 Run `npm run lint` and fix any issues
- [x] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 5.3 Run `npm run test` and fix any issues
- [x] 5.4 Run `npm run test:e2e` and fix any issues
- [x] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
