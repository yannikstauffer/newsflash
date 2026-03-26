## 1. Setup

- [x] 1.1 Install shadcn Switch component (`npx shadcn@latest add switch`) and verify `src/components/ui/switch.tsx` is created
- [x] 1.2 Add new i18n translation keys to `src/locales/en.json` and `src/locales/de.json` (section descriptions, Enable All, Disable All)

## 2. Hook Changes

- [x] 2.1 Add `enableAll` and `disableAll` functions to `useFeedPreferences` hook that accept all feed IDs and delegate to `setStore`
- [x] 2.2 Add unit tests for `enableAll` and `disableAll` in `use-feed-preferences.test.ts`

## 3. Card Layout and Grid

- [x] 3.1 Wrap Language, Appearance, and Sources sections in card containers (`rounded-lg border border-border p-6`)
- [x] 3.2 Add muted description text (`text-sm text-muted-foreground`) below each section heading using i18n keys
- [x] 3.3 Wrap Language and Appearance cards in a responsive grid (`grid grid-cols-1 lg:grid-cols-2 gap-4`) with items-stretch for equal height

## 4. Toggle Switches

- [x] 4.1 Replace connector-level checkboxes with shadcn Switch in `feed-config-page.tsx` — right-aligned with `justify-between`, remove indeterminate ref logic
- [x] 4.2 Replace group-level checkboxes with shadcn Switch in `feed-group.tsx` — right-aligned, remove indeterminate ref logic
- [x] 4.3 Replace individual feed checkboxes with shadcn Switch in `feed-group.tsx` — right-aligned with feed name on the left
- [x] 4.4 Replace ungrouped feed checkboxes with shadcn Switch in `feed-config-page.tsx` — right-aligned

## 5. Bulk Toggle

- [x] 5.1 Add "Enable All" and "Disable All" ghost buttons to the Sources section header row in `feed-config-page.tsx`, right-aligned next to the heading
- [x] 5.2 Wire buttons to `enableAll`/`disableAll` with localStorage cleanup (call `removeHiddenBySource` and `removeReadListBySource` for each connector on disable all)

## 6. Testing

- [x] 6.1 Update E2E tests in `settings.spec.ts` — change checkbox selectors to switch role selectors, update check/uncheck calls to click/toggle
- [x] 6.2 Run `npm run lint` and fix any issues
- [x] 6.3 Run `npm run test` and fix any failures
- [x] 6.4 Run E2E tests and verify settings page works end-to-end
