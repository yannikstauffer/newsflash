## 1. Soften Light Theme CSS

- [x] 1.1 Update `--foreground` in `index.css` `:root` from `oklch(0.145 0 0)` to approximately `oklch(0.25 0 0)`
- [x] 1.2 Update `--primary` from `oklch(0.205 0 0)` to approximately `oklch(0.30 0 0)`
- [x] 1.3 Update `--background` from `oklch(1 0 0)` to approximately `oklch(0.98 0 0)`
- [x] 1.4 Keep `--card` at `oklch(1 0 0)` (pure white)
- [x] 1.5 Soften `--border` and other related tokens to match the gentler palette
- [x] 1.6 Update corresponding custom vars (`--text`, `--text-h`, `--bg`) to stay consistent
- [x] 1.7 Visually verify the softened palette looks cohesive

## 2. Theme Preference Hook

- [x] 2.1 Create `useThemePreference` hook storing `"light" | "dark"` in `newsflash:theme` localStorage key
- [x] 2.2 Hook initializer reads preference synchronously (via `useLocalStorage`) to avoid flash
- [x] 2.3 Add `useEffect` that applies/removes `.dark` class on `document.documentElement` when preference changes
- [x] 2.4 Write tests for `useThemePreference` covering default (light), toggle, and persistence

## 3. Dark Mode Toggle in Settings

- [x] 3.1 Add "Appearance" section to `feed-config-page.tsx` with Light/Dark segmented control
- [x] 3.2 Wire segmented control to `useThemePreference` hook
- [x] 3.3 Place "Appearance" section after "Language" section

## 4. Verification

- [x] 4.1 Run `npm run lint` and fix any issues
- [x] 4.2 Run `npm run test` and verify all tests pass
- [x] 4.3 Run JetBrains diagnostics on changed files
