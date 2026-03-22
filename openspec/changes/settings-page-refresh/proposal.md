## Why

The settings page uses native HTML checkboxes for source toggles, which look unstyled and inconsistent with the rest of the UI. The flat layout lacks visual hierarchy — all three sections (Language, Appearance, Sources) run together without clear grouping. On desktop, the page doesn't use available horizontal space effectively.

## What Changes

- **Replace checkboxes with toggle switches**: Use shadcn Switch components, right-aligned in each row. Drop indeterminate state on parent toggles — the "X/Y on" count badge already communicates partial state.
- **Wrap sections in cards**: Each settings section gets a bordered card container for visual grouping.
- **Add section descriptions**: Muted description text below each section heading explaining what the section controls (EN + DE translations).
- **Two-column desktop layout**: On `lg:` breakpoint, Language and Appearance cards sit side-by-side in a grid row with equal stretch height. Sources remains full-width below.
- **Enable All / Disable All buttons**: Ghost variant buttons at the top-right of the Sources section header for bulk toggling all feeds.

## Capabilities

### New Capabilities

- `settings-toggle-switches`: Replace native checkboxes with shadcn Switch components for feed source toggles, right-aligned with label on the left.
- `settings-card-layout`: Wrap settings sections in card containers with descriptions and responsive two-column grid on desktop.
- `settings-bulk-toggle`: Enable All / Disable All ghost buttons for bulk feed toggling in the Sources section.

### Modified Capabilities

- `feed-configuration`: Toggle interaction changes from checkbox to switch; indeterminate state removed from parent connectors.

## Impact

- **Components**: `feed-config-page.tsx`, `feed-group.tsx` (layout + toggle changes)
- **Hooks**: `use-feed-preferences.ts` (new enableAll/disableAll functions)
- **UI library**: New shadcn Switch component (`src/components/ui/switch.tsx`)
- **i18n**: New translation keys in `en.json` / `de.json` for section descriptions and button labels
- **E2E tests**: `settings.spec.ts` selectors need updating (checkbox → switch)
