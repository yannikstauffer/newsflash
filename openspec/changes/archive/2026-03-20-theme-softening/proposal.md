## Why

The current light theme uses pure black text on pure white backgrounds, creating harsh contrast that strains the eyes during extended reading. Softening the palette to dark grays and a subtle off-white background improves readability without introducing distinct accent colors.

## What Changes

- Soften `--foreground` from pure black to dark gray
- Soften `--primary` from pure black to dark gray
- Change page `--background` to subtle off-white; keep `--card` as pure white for lift
- Soften border colors to match the gentler palette
- Add a dark mode toggle to the settings page (persisted in localStorage, defaults to light)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `ui-polish`: Softened light theme colors, dark mode toggle in settings

## Impact

- `src/index.css` — adjust oklch values for light theme CSS custom properties
- `src/features/feed-config/components/feed-config-page.tsx` — add "Appearance" section with dark mode toggle
- New hook or extension for theme preference persistence
- Root-level logic to apply/remove `.dark` class based on preference
