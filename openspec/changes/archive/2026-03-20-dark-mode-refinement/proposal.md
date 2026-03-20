## Why

The dark mode uses near-black backgrounds (`oklch(0.145 0 0)`) and near-white foregrounds (`oklch(0.985 0 0)`) with zero chroma — harsh, high-contrast, and lifeless. The legacy custom properties (`--bg: #16171d`) already carry a blue-violet tint that feels better but the shadcn/Tailwind variables don't match, creating inconsistency.

Separately, article cards use hard `border-border` outlines in both themes. In dark mode especially, borders on dark surfaces look heavy. Replacing the border with background differentiation and a subtle shadow creates a more modern, layered feel.

## What Changes

### Dark palette overhaul
- Introduce a cool blue-violet tint (hue ~265, low chroma) across all `.dark` variables
- Raise background lightness from 0.145 → 0.18 and narrow the contrast gap (foreground from 0.985 → 0.93)
- Align shadcn variables with the legacy `#16171d` direction
- Unify legacy `prefers-color-scheme` vars and `.dark` class vars to use consistent tones

### Card surface treatment
- Remove hard `border border-border` from article cards
- Use `bg-card` to create lift against `bg-background` (works in both light and dark themes since card is already lighter than background)
- Add a subtle resting shadow and slightly stronger hover shadow
- Keep existing hover background transition

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `ui-polish`: Cool-tinted dark palette, borderless card surfaces
- `card-redesign`: Card visual treatment updated (border → shadow + background lift)

## Impact

- `src/index.css` — rewrite `.dark` block with cool-tinted oklch values; align legacy `prefers-color-scheme` vars
- `src/features/feed/components/article-card.tsx` — replace `border border-border` with `bg-card shadow-sm` and updated hover states
- `openspec/specs/card-redesign/spec.md` — update card hover/interaction requirement to reflect shadow-based treatment
