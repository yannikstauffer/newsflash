## 1. Dark Palette — CSS Variables

- [x] 1.1 Update `.dark` block background surfaces: `--background`, `--card`, `--popover`, `--sidebar`, `--muted`, `--secondary`, `--accent` with cool-tinted oklch values (hue 265)
- [x] 1.2 Update `.dark` block foregrounds: `--foreground`, `--card-foreground`, `--popover-foreground`, `--sidebar-foreground`, `--muted-foreground`, `--primary`, `--primary-foreground`, `--secondary-foreground`, `--accent-foreground` with cool-tinted values
- [x] 1.3 Update `.dark` block borders/inputs: `--border`, `--input`, `--ring`, `--sidebar-border`, `--sidebar-ring` with explicit cool colors (replace white-at-opacity approach)
- [x] 1.4 Keep `--destructive` warm and chart colors achromatic (no changes)
- [x] 1.5 Verify legacy `prefers-color-scheme: dark` vars are consistent with new `.dark` direction

## 2. Card Surface Treatment

- [x] 2.1 In `article-card.tsx`, replace `border border-border` with `bg-card` and a subtle resting shadow
- [x] 2.2 Update hover state from `hover:bg-muted/50 hover:shadow-sm` to `hover:shadow-md` (background already differentiated)
- [x] 2.3 Add dark-specific shadow override for visibility on dark backgrounds

## 3. Spec Updates

- [x] 3.1 Update `card-redesign/spec.md` hover/interaction requirement to reflect shadow-based treatment instead of border

## 4. Verification

- [x] 4.1 Run `npm run lint` and fix any issues
- [x] 4.2 Run `npm run test` and verify all tests pass
- [x] 4.3 Run JetBrains diagnostics on changed files
- [ ] 4.4 Visually verify dark mode at multiple viewport sizes
