# Proposal: Clean Up className Soup

## Problem

Components across the app rely on long inline Tailwind className strings (often 100-200+ chars), duplicated class combinations, and template literal conditionals for styling. This makes components hard to read, review, and maintain.

Quantified duplication:
- **Touch-target overrides**: 9 occurrences across 5 files — always overriding Button's className
- **Settings section pattern**: 6 identical `<section>` blocks across 2 files
- **Segmented control**: 2 copy-pasted radio groups with 153-char classNames
- **Search input**: 2 near-identical input blocks sharing ~80% of classes
- **Settings row (label + switch)**: 5 identical blocks across 2 files
- **Template literal conditionals**: 5+ instances where `cn()` should be used instead

## Approach

**Hybrid: Components for structure, CVA for variant styling** (Approach 4 from prior analysis).

- Extract repeated **structural patterns** into shared components
- Use **CVA variants** for styling axes within components (dimmed, image layout, touch targets)
- Adopt **`cn()` consistently** for all conditional class merging
- Replace hand-rolled elements with existing `<Button>` where appropriate

## Scope

Single cleanup pass. Every `.tsx` component in `src/` is in scope. shadcn/ui primitives (`alert-dialog`, `switch`, `sonner`) are excluded — they follow their own pattern and the complexity is already contained.

## Deliverables

| New/Modified | Name | Purpose |
|---|---|---|
| New component | `<SettingsSection>` | Wraps title + description + children in bordered card |
| New component | `<SegmentedControl>` | Generic radio group with keyboard navigation |
| New component | `<SearchInput>` | Search with icon, clear, mobile expand/collapse |
| New component | `<SettingRow>` | Label + Switch with touch-target spacing |
| New component | `<BottomNav>` | App navigation bar extracted from AppLayout (lives in `src/app/components/` because it depends on `features/sync`) |
| Modified CVA | `button-variants.ts` | Touch-target sizes baked into existing size variants |
| New CVA | `card-variants.ts` | ArticleCard variants (dimmed, image layout) |
| Refactor | All template literals | Replace with `cn()` calls |
| Refactor | `error-boundary.tsx` | Replace hand-rolled button with `<Button>` |
| Updated | All colocated tests | Adjusted for new component structure |

## Out of Scope

- Changing any visual appearance or behaviour
- Adding new features
- Modifying shadcn/ui primitives
- Changing the module boundary architecture
