## Context

The light theme in `index.css` uses oklch colors with chroma 0 (pure grayscale) at extreme lightness values — `0.145` for foreground (near-black) and `1.0` for background (pure white). The `.dark` class variant exists but has no user-accessible toggle.

## Goals / Non-Goals

**Goals:**
- Soften light theme to reduce eye strain (dark gray text, off-white background)
- Keep cards white for visual lift against the off-white page
- Add a dark mode toggle in settings, persisted to localStorage

**Non-Goals:**
- Redesigning the dark theme (explicitly deferred)
- Adding accent/brand colors
- System theme detection (defaults to light for predictable behavior)

## Decisions

### 1. Adjust oklch lightness values, keep chroma at 0

Stay in pure grayscale (chroma 0) but shift lightness:
- `--foreground`: `0.145` → ~`0.25` (softer dark gray)
- `--primary`: `0.205` → ~`0.30` (softer for buttons/interactive)
- `--background`: `1.0` → ~`0.98` (subtle off-white)
- `--card`: stays `1.0` (pure white)
- `--border`: `0.922` → ~`0.93` (slightly softer)
- `--muted-foreground`: stays ~`0.556` (already comfortable)

Exact values may need visual tuning during implementation.

### 2. Theme preference via `useThemePreference` hook

A dedicated hook stores theme preference (`"light" | "dark"`) in `newsflash:theme` localStorage key. On app load, the hook reads the preference and applies/removes the `.dark` class on `document.documentElement`.

**Why a separate hook?** Theme is a global UI concern, not a feed preference. Keeping it separate from `useFeedPreferences` follows single-responsibility.

### 3. Dark mode toggle as segmented control in settings

Add an "Appearance" section to the settings page with a Light/Dark segmented control, similar to the language selector pattern. Placed below the "Language" section.

### 4. Apply `.dark` class on `<html>` element

The existing CSS uses `.dark` class for dark mode variables. The hook uses `document.documentElement.classList.add/remove("dark")` for immediate effect. This runs in a `useEffect` that syncs class with preference state.

## Risks / Trade-offs

- **Exact lightness values are subjective** — the proposed values are starting points. Implementation should visually verify and adjust. The spec provides approximate targets, not exact requirements.
- **Flash of wrong theme on load** — if the hook runs after first paint, there may be a brief flash. Mitigated by reading localStorage synchronously in the hook's initializer (which `useLocalStorage` already does).
