## 1. Theme Hook Refactor

- [ ] 1.1 Expand `ThemePreference` type to `"light" | "dark" | "system"` and change default from `getOsThemePreference()` to `"system"` in `use-theme-preference.ts`
- [ ] 1.2 Add resolved theme logic: compute effective `"light"` or `"dark"` from preference + OS detection
- [ ] 1.3 Add `matchMedia("(prefers-color-scheme: dark)")` change event listener when preference is `"system"`, with cleanup when switching away
- [ ] 1.4 Update the `useEffect` to apply/remove `dark` class based on resolved theme

## 2. FOUC Prevention

- [ ] 2.1 Add blocking inline `<script>` in `index.html` `<head>` that reads `newsflash:theme` from localStorage, resolves `"system"` via `matchMedia`, and applies `dark` class before first paint

## 3. App Integration

- [ ] 3.1 Call `useThemePreference()` in `AppLayout` so the hook runs on every route

## 4. Settings UI Update

- [ ] 4.1 Add "System" as third option in the appearance radio group in `FeedConfigPage`

## 5. Tests

- [ ] 5.1 Update `use-theme-preference.test.ts`: tests for `"system"` default, OS resolution, `matchMedia` listener attach/detach, and cleanup
- [ ] 5.2 Update or add tests verifying theme applies on non-settings routes (AppLayout integration)
