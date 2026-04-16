# Tasks: Clean Up className Soup

## Phase 1: Foundation

- [x] **1.1** Modify `button-variants.ts` — bake touch-target sizing into `icon-xs`, `icon-sm`, and `sm` size variants. Mobile gets 44px min, desktop shrinks back.
- [x] **1.2** Create `card-variants.ts` in `src/features/feed/components/` — CVA with `hasImage` and `dimmed` variants for ArticleCard.
- [x] **1.3** Create `<SettingsSection>` in `src/components/settings-section.tsx` — title, description, optional headerAction, children. Include colocated test.
- [x] **1.4** Create `<SegmentedControl>` in `src/components/segmented-control.tsx` — generic typed radio group with arrow key navigation, Home/End, roving tabindex. Include colocated test.
- [x] **1.5** Create `<SearchInput>` in `src/components/search-input.tsx` — search icon, clear button, mobile expand/collapse (internal state), auto-focus on expand, Escape to collapse. Include colocated test.
- [x] **1.6** Create `<SettingRow>` in `src/components/setting-row.tsx` — label + Switch with touch-target spacing. Include colocated test.
- [x] **1.7** Create `<BottomNav>` in `src/app/components/bottom-nav.tsx` — extract from app-layout.tsx (NAV_ITEMS, formatBadgeCount, nav element, badge logic). Placed in `app/` because it depends on `features/sync` (SyncNavIcon + useSyncContext) and shared modules can't import features. Include colocated test.

## Phase 2: Consumers

- [x] **2.1** Refactor `app-layout.tsx` — use `<BottomNav>`, clean up skip-link className with `cn()`. Update `app-layout.test.tsx`.
- [x] **2.2** Refactor `article-card.tsx` — use `articleCardVariants` from card-variants.ts. Update `article-card.test.tsx`.
- [x] **2.3** Refactor `filter-bar.tsx` — use `<SearchInput>`, remove internal search state/refs/handlers. Remove touch-target className overrides on Buttons. Update `filter-bar.test.tsx`.
- [x] **2.4** Refactor `feed-config-page.tsx` — use `<SettingsSection>`, `<SegmentedControl>`, `<SettingRow>`. Update `feed-config-page.test.tsx`.
- [x] **2.5** Refactor `feed-group.tsx` — use `<SettingRow>`, replace template literal with `cn()` for chevron rotation. Update `feed-group.test.tsx`.
- [x] **2.6** Refactor `sync-settings.tsx` — use `<SettingsSection>` for both authenticated and unauthenticated views.
- [x] **2.7** Refactor `article-action-buttons.tsx` — remove touch-target className overrides, use `cn()` for bookmark fill. Update `article-action-buttons.test.tsx`.
- [x] **2.8** Refactor `hidden-article-actions.tsx` — remove touch-target className override.
- [x] **2.9** Refactor `read-list-page.tsx` — remove touch-target className overrides. Update `read-list-page.test.tsx`.
- [x] **2.10** Refactor `swipeable-card.tsx` — replace template literal classNames with `cn()`. Update `swipeable-card.test.tsx`.
- [x] **2.11** Refactor `sync-nav-icon.tsx` — replace template literal with `cn()`. Update `sync-nav-icon.test.tsx`.
- [x] **2.12** Refactor `error-boundary.tsx` — replace hand-rolled `<button>` with `<Button>`. Update `error-boundary.test.tsx`.

## Phase 3: Verification

- [x] **3.1** Run full test suite (`npm test`) — all tests pass.
- [x] **3.2** Run linter (`npm run lint`) — no new warnings or errors.
- [x] **3.3** Run type check (`npm run build`) — compiles cleanly.
- [x] **3.4** Visual smoke test in browser — verify no pixel changes at 375px, 768px, 1440px widths.
