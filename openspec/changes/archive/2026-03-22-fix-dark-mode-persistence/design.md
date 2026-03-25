## Context

The app uses Tailwind's `dark` class strategy — toggling `.dark` on `<html>` switches all `dark:` variants. Currently, the `useThemePreference` hook is only consumed by `FeedConfigPage`, so the `useEffect` that applies the class only runs when the settings page is mounted. On reload from any other route, the class is never applied.

The hook stores `"light" | "dark"` in localStorage under `newsflash:theme` and falls back to `matchMedia("(prefers-color-scheme: dark)")` at initialization time — but this OS detection is a one-shot read, not a live listener.

## Goals / Non-Goals

**Goals:**
- Theme persists correctly across page reloads on all routes
- No flash of wrong theme (FOUC) on initial load
- "System" preference that tracks OS color scheme in real-time
- "System" is the default for new users and users with no stored preference

**Non-Goals:**
- Per-route or scheduled theme switching
- Theme transition animations
- Server-side rendering considerations (this is a client-only SPA)

## Decisions

### 1. Blocking inline script in `<head>` for FOUC prevention

**Decision:** Add a synchronous `<script>` in `index.html` `<head>` that reads localStorage and applies the `dark` class before first paint.

**Why:** React's `useEffect` runs after paint. Even hoisting the hook to `AppLayout` would cause a single-frame flash on reload. The inline script runs synchronously during HTML parsing, before any rendering occurs.

**Alternative considered:** Using `useLayoutEffect` instead of `useEffect` — still runs after DOM mutation but before paint. Closer, but the React bundle itself must load first, which is too late for initial HTML rendering. The inline script is the established pattern (Next.js, Remix, etc. all do this).

**Script logic:**
```
1. Read newsflash:theme from localStorage
2. Parse JSON → value is "light", "dark", "system", or missing
3. If "dark" → add class
4. If "light" → no class (default)
5. If "system" or missing → check matchMedia("(prefers-color-scheme: dark)")
6. Apply/remove "dark" class on <html>
```

### 2. Hoist `useThemePreference()` to `AppLayout`

**Decision:** Call the hook in `AppLayout` (the root route component) in addition to `FeedConfigPage`.

**Why:** `AppLayout` is always mounted regardless of route. The hook's `useEffect` keeps the `dark` class in sync with React state and attaches the `matchMedia` listener for "system" mode. `FeedConfigPage` continues calling the same hook for its UI controls — React deduplicates the underlying `useLocalStorage` state.

**Alternative considered:** Calling it in `App.tsx` or `main.tsx` — `AppLayout` is preferable because it's the actual root component that renders on every route, and it keeps the hook within the React component tree (not above the router).

### 3. `matchMedia` change listener for "system" mode

**Decision:** When preference is `"system"`, attach a `change` event listener on `matchMedia("(prefers-color-scheme: dark)")`. Clean up when preference changes away from "system" or on unmount.

**Why:** Users expect real-time response when toggling OS dark mode. Without the listener, "system" would only detect the OS theme at mount time.

**Implementation:** The `useEffect` that applies the `dark` class will also conditionally register/unregister the listener based on the current preference value.

### 4. Default to `"system"` instead of resolving OS preference eagerly

**Decision:** Change the `useLocalStorage` default from `getOsThemePreference()` (which returned `"light"` or `"dark"`) to the literal `"system"`.

**Why:** This makes the three-way preference explicit. "System" is the standard default in modern apps. Existing users with `"light"` or `"dark"` already stored keep their preference — only new users (empty localStorage) get `"system"`.

## Risks / Trade-offs

- **Inline script adds ~200 bytes to initial HTML** → Negligible cost, standard practice for theme FOUC prevention.
- **Duplicate theme logic** (inline script + React hook both resolve "system") → Necessary because the script runs before React. Keep the resolution logic simple and identical in both places.
- **`matchMedia` listener not supported in very old browsers** → `addEventListener("change", ...)` on `MediaQueryList` is supported in all evergreen browsers. Graceful degradation: theme just won't auto-switch.
