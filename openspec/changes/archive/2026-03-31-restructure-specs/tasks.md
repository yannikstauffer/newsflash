## 1. Create Domain Folders

- [x] 1.1 Create directories: `openspec/specs/{feed,article-card,filter-bar,settings,navigation,sync,ui,devops}`

## 2. Merge Feed Specs

- [x] 2.1 Create `feed/connectors.md` by merging `feed-connectors`, `connector-folder-structure`, `connector-article-filters`, `e2e-test-maintenance`
- [x] 2.2 Create `feed/filtering.md` by merging `feed-filtering`, `feed-configuration`, `feed-page-orchestration`, `feed-page-hook-tests`, `hook-unit-tests`
- [x] 2.3 Create `feed/proxy.md` by merging `feed-proxy`, `feed-proxy-production`
- [x] 2.4 Move `srf-category-filters/spec.md` → `feed/srf-connector.md`
- [x] 2.5 Move `article-feed/spec.md` → `feed/data-caching.md`
- [x] 2.6 Move `feed-grouping/spec.md` → `feed/grouping.md`

## 3. Merge Article Card Specs

- [x] 3.1 Create `article-card/layout.md` by merging `card-redesign`, `card-description-clamp`, `mobile-card-layout`
- [x] 3.2 Create `article-card/content.md` by merging `inline-image-extraction`, `html-sanitization`
- [x] 3.3 Create `article-card/actions.md` by merging `article-actions`, `bulk-article-actions`
- [x] 3.4 Create `article-card/swipe.md` by merging `swipe-gesture-detection`, `swipe-reveal-background`, `card-removal-animation`

## 4. Merge Filter Bar Specs

- [x] 4.1 Create `filter-bar/filter-bar.md` by merging `filter-bar-refinement`, `filter-bar-responsive-layout`, `sticky-filter-bar`

## 5. Merge Settings Specs

- [x] 5.1 Create `settings/ui.md` by merging `settings-toggle-switches`, `settings-bulk-toggle`, `settings-card-layout`
- [x] 5.2 Create `settings/locale.md` by merging `app-locale-setting`, `i18n-infrastructure`
- [x] 5.3 Move `settings-sync/spec.md` → `settings/sync.md`

## 6. Move Navigation Specs

- [x] 6.1 Move `app-layout/spec.md` → `navigation/layout.md`
- [x] 6.2 Move `client-side-routing/spec.md` → `navigation/routing.md`
- [x] 6.3 Move `lazy-loading/spec.md` → `navigation/lazy-loading.md`
- [x] 6.4 Move `read-list-badge/spec.md` → `navigation/read-list-badge.md`

## 7. Move and Merge Sync Specs

- [x] 7.1 Move `supabase-auth/spec.md` → `sync/auth.md`
- [x] 7.2 Move `sync-ui/spec.md` → `sync/ui.md`
- [x] 7.3 Create `sync/storage.md` by merging `storage-pruning`, `theme-persistence`

## 8. Move and Merge UI Specs

- [x] 8.1 Create `ui/polish.md` by merging `ui-polish`, `favicon-gradient`
- [x] 8.2 Move `wcag-fixes/spec.md` → `ui/accessibility.md`
- [x] 8.3 Move `error-boundary/spec.md` → `ui/error-handling.md`

## 9. Merge DevOps Specs

- [x] 9.1 Create `devops/ci-cd.md` by merging `ci-cd-pipeline`, `release-artifacts`, `release-automation`
- [x] 9.2 Create `devops/dx.md` by merging `dx-improvements`, `project-cleanup`
- [x] 9.3 Create `devops/testing.md` by merging `e2e-testing`, `test-coverage-config`

## 10. Cleanup

- [x] 10.1 Delete all 51 old spec directories from `openspec/specs/`
- [x] 10.2 Verify all 27 new spec files exist in their domain folders
- [x] 10.3 Verify no requirements were lost by comparing total requirement count before and after

## 11. Quality Gates

- [x] 11.1 Run `npm run lint` and fix any issues
- [x] 11.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 11.3 Run `npm run test` and fix any issues
- [x] 11.4 Run `npm run test:e2e` and fix any issues
- [x] 11.5 N/A — spec-only change, no application code files to diagnose
- [x] 11.6 No docs updates needed — pure structural reorganization of spec files
