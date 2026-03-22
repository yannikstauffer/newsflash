## Context

The settings page (`feed-config-page.tsx`) currently uses a flat `space-y-8` layout with three sections: Language, Appearance, and Sources. Sources use native HTML checkboxes with indeterminate state for partial selections. The page doesn't leverage horizontal space on desktop and lacks visual grouping between sections.

shadcn/ui is already in use (Button, AlertDialog, Toaster) but Switch is not yet installed. The project uses `@base-ui/react` as the underlying headless library.

## Goals / Non-Goals

**Goals:**
- Replace native checkboxes with shadcn Switch components (right-aligned) for a polished toggle UX
- Add card containers around each settings section for visual hierarchy
- Add muted description text to each section
- Use a two-column grid on desktop (`lg:`) for Language + Appearance, with Sources full-width below
- Add Enable All / Disable All ghost buttons in the Sources section header
- Maintain full i18n support (EN + DE)

**Non-Goals:**
- Redesigning the radio button groups for Language/Appearance (they work well as-is)
- Adding search/filter for sources (future consideration)
- Changing the underlying data model or localStorage structure
- Adding new shadcn Card component — plain Tailwind `rounded-lg border` is sufficient

## Decisions

### 1. shadcn Switch over custom toggle

**Decision:** Install shadcn Switch component via CLI.

**Rationale:** Already using shadcn/ui for Button and AlertDialog. Switch provides accessible toggle with keyboard support, focus ring, and consistent styling out of the box. No point building a custom one.

**Alternative considered:** Custom CSS toggle on native checkbox — more work, less accessible, inconsistent with existing UI components.

### 2. Drop indeterminate state on parent toggles

**Decision:** Connector-level and group-level toggles use simple on/off Switch. No indeterminate visual state.

**Rationale:** The "X/Y on" count badge on groups already communicates partial state clearly. Switch components don't have a native indeterminate state, and faking one (e.g., muted track color) adds complexity for marginal benefit. The toggle answers "is this on or off?" and the badge answers "how many?".

**Connector-level toggle logic:** ON if all feeds enabled, OFF otherwise. Toggling ON enables all feeds; toggling OFF disables all feeds.

**Alternative considered:** Custom partial-fill toggle track — confusing UX, non-standard, harder to implement.

### 3. Right-aligned switches with flexbox

**Decision:** Each row uses `flex items-center justify-between` with label on the left and Switch on the right.

**Rationale:** This is the standard settings pattern (iOS, Android, macOS). Puts the label and control at predictable positions. The right column of switches creates a clean visual line.

### 4. Card layout with Tailwind (no shadcn Card)

**Decision:** Use `rounded-lg border border-border p-6` divs for section cards. No shadcn Card install.

**Rationale:** shadcn Card is just a styled div with subcomponents (CardHeader, CardContent, etc.) that add indirection without benefit here. Plain Tailwind achieves the same result with less abstraction.

### 5. Two-column grid for Language + Appearance

**Decision:** Wrap Language and Appearance cards in `grid grid-cols-1 lg:grid-cols-2 gap-4`. Sources section stays outside the grid as full-width.

**Rationale:** Language and Appearance are small, related settings that fit naturally side-by-side. Grid `items-stretch` (default) ensures equal card heights. On mobile (`< lg`), they stack vertically.

### 6. Enable All / Disable All as ghost buttons

**Decision:** Two ghost variant Button components in the Sources section header row, right-aligned.

**Rationale:** Ghost buttons are visually subtle but clearly interactive. They don't compete with the section heading for attention. Using the existing Button component with `variant="ghost" size="sm"`.

### 7. Bulk toggle implementation

**Decision:** Add `enableAll()` and `disableAll()` functions to `useFeedPreferences` that iterate all connector feeds.

**Rationale:** The hook already has `setAllForSource`. Bulk toggle is the same pattern applied across all connectors. The functions accept the full feed ID list and delegate to the existing `setStore` mechanism.

When disabling all, cleanup logic (removeHiddenBySource, removeReadListBySource) must run for each connector — same as the existing per-source disable flow.

## Risks / Trade-offs

**[E2E test breakage]** → Tests use `page.getByLabel("Digitec")` and checkbox-specific methods (`uncheck()`/`check()`). Switching to shadcn Switch changes the DOM structure and ARIA roles. Mitigation: Update E2E selectors to use switch role or the accessible name pattern that shadcn Switch provides.

**[Accessibility regression]** → Native checkboxes have built-in keyboard/screen-reader support. Mitigation: shadcn Switch is built on Radix (or @base-ui) which provides equivalent ARIA roles (`role="switch"`, `aria-checked`), keyboard support (Space to toggle), and focus management. Verify with axe-core in E2E.

**[Visual density on mobile]** → Switches are wider than checkboxes, which could feel crowded on small screens. Mitigation: The right-alignment naturally uses available space. Test at 320px to confirm.
