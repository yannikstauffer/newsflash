## Context

The `.dark` block in `index.css` uses pure achromatic oklch values (chroma 0) at extreme lightness — 0.145 background, 0.985 foreground. The legacy `prefers-color-scheme: dark` vars (`--bg: #16171d`, `--border: #2e303a`) already have a blue-violet tint but the shadcn variables don't match. Article cards use `border border-border` which looks heavy on dark surfaces.

## Goals / Non-Goals

**Goals:**
- Cool blue-violet dark palette (hue ~265) with low chroma across all `.dark` variables
- Narrower contrast gap (L 0.18–0.93 instead of 0.145–0.985)
- Borderless card treatment using background lift + subtle shadow
- Consistency between legacy vars and shadcn vars

**Non-Goals:**
- Changing the light theme (already softened in theme-softening change)
- Adding accent/brand colors beyond the existing purple
- System theme detection (already scoped out)

## Decisions

### 1. Cool-tinted oklch palette at hue 265

All `.dark` variables shift from chroma 0 to chroma 0.005–0.015 at hue 265 (blue-violet), matching the existing `#16171d` direction and the `--sidebar-primary` hue of 264.376.

**Background surfaces** (very low chroma, 0.006–0.010):
```
--background:   oklch(0.18  0.008 265)   page base
--sidebar:      oklch(0.20  0.008 265)   sidebar (slightly lifted)
--card:         oklch(0.22  0.008 265)   card / popover surfaces
--muted:        oklch(0.27  0.010 265)   muted / secondary / accent backgrounds
```

**Foregrounds** (slightly higher chroma for readability):
```
--foreground:   oklch(0.93  0.005 265)   primary text
--muted-fg:     oklch(0.65  0.015 265)   secondary text
--primary:      oklch(0.90  0.010 265)   interactive / emphasized text
--primary-fg:   oklch(0.20  0.008 265)   text on primary surfaces
```

**Borders and inputs** (explicit cool color instead of white-at-opacity):
```
--border:       oklch(0.35  0.015 265)   visible cool edge
--input:        oklch(0.30  0.012 265)   input field backgrounds
--ring:         oklch(0.55  0.020 265)   focus rings
```

**Chart colors** stay achromatic — data visualization shouldn't carry the cool tint.

**Destructive** stays warm (`oklch(0.704 0.191 22.216)`) for semantic contrast against the cool palette.

### 2. Legacy vars aligned to cool direction

The `prefers-color-scheme: dark` block already uses cool-tinted hex values. These stay as-is since they're already aligned:
- `--bg: #16171d` (cool)
- `--border: #2e303a` (cool)
- `--text: #9ca3af` (cool gray)

### 3. Borderless card treatment

Replace the hard border with background differentiation and shadow:

**Current:** `border border-border` → hard line around card
**New:** `bg-card shadow-sm` → card surface lifts off page via color + shadow

This works in both themes:
- Light: card is `oklch(1 0 0)` (white) against background `oklch(0.98 0 0)` (off-white)
- Dark: card is `oklch(0.22 0.008 265)` against background `oklch(0.18 0.008 265)`

Hover state: slightly stronger shadow (`hover:shadow-md`) instead of the current `hover:bg-muted/50 hover:shadow-sm`.

The dark mode shadow needs custom values since Tailwind's default shadows are barely visible on dark backgrounds. Add a dark-specific shadow using `dark:shadow-[...]` or adjust the `--shadow` CSS variable.

### 4. Dark shadow visibility

Tailwind's `shadow-sm` / `shadow-md` use light rgba values that vanish on dark backgrounds. Options:
- **Option A**: Use `dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]` overrides
- **Option B**: Rely purely on background differentiation in dark mode, no shadow

Recommend **Option A** — the shadow adds a tactile quality even in dark mode, just needs stronger opacity.

## Risks / Trade-offs

- **Exact oklch values are subjective** — the proposed values are starting points from our exploration. Visual tuning during implementation is expected.
- **Border removal affects all cards** — any component using `border-border` on cards needs updating. Currently only `article-card.tsx`.
- **Dark shadows are subtle** — even with higher opacity, shadows on dark backgrounds are understated. The primary lift mechanism is the background color difference, with shadow as a secondary cue.
