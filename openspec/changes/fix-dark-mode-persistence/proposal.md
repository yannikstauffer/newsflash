## Why

The dark mode setting is lost on page reload because `useThemePreference` is only called inside `FeedConfigPage`. When users navigate away from settings or refresh any other page, the `useEffect` that applies the `dark` CSS class never runs — causing a flash to light theme despite the preference being saved in localStorage.

Additionally, there is no "System" option that follows the OS color scheme in real-time, which is the expected default for modern web apps.

## What Changes

- Expand `ThemePreference` type from `"light" | "dark"` to `"light" | "dark" | "system"`
- Default to `"system"` when no preference is stored (follows OS `prefers-color-scheme`)
- Add a `matchMedia` change listener so "system" mode reacts to OS theme changes in real-time
- Add a blocking inline `<script>` in `index.html` `<head>` to apply the theme class before first paint (prevents FOUC)
- Hoist `useThemePreference()` call to `AppLayout` so the effect runs on every route
- Add "System" as a third option in the settings appearance radio group

## Capabilities

### New Capabilities
- `theme-persistence`: Theme preference storage, resolution (including "system" → OS detection), FOUC prevention, and real-time OS theme tracking

### Modified Capabilities
- `feed-configuration`: Settings UI gains a third "System" appearance option

## Impact

- `src/hooks/use-theme-preference.ts` — new type, matchMedia listener, new default
- `src/hooks/use-theme-preference.test.ts` — tests for system preference + listener
- `index.html` — blocking theme script in `<head>`
- `src/app/app-layout.tsx` — hook call at root layout
- `src/features/feed-config/components/feed-config-page.tsx` — third appearance button
