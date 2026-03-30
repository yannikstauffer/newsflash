## 1. Create Domain Folders

- [ ] 1.1 Create directories: `openspec/specs/{feed,article-card,filter-bar,settings,navigation,sync,ui,devops}`

## 2. Merge Feed Specs

- [ ] 2.1 Create `feed/connectors.md` by merging `feed-connectors`, `connector-folder-structure`, `connector-article-filters`, `e2e-test-maintenance`
- [ ] 2.2 Create `feed/filtering.md` by merging `feed-filtering`, `feed-configuration`, `feed-page-orchestration`, `feed-page-hook-tests`, `hook-unit-tests`
- [ ] 2.3 Create `feed/proxy.md` by merging `feed-proxy`, `feed-proxy-production`
- [ ] 2.4 Move `srf-category-filters/spec.md` → `feed/srf-connector.md`
- [ ] 2.5 Move `article-feed/spec.md` → `feed/data-caching.md`
- [ ] 2.6 Move `feed-grouping/spec.md` → `feed/grouping.md`

## 3. Merge Article Card Specs

- [ ] 3.1 Create `article-card/layout.md` by merging `card-redesign`, `card-description-clamp`, `mobile-card-layout`
- [ ] 3.2 Create `article-card/content.md` by merging `inline-image-extraction`, `html-sanitization`
- [ ] 3.3 Create `article-card/actions.md` by merging `article-actions`, `bulk-article-actions`
- [ ] 3.4 Create `article-card/swipe.md` by merging `swipe-gesture-detection`, `swipe-reveal-background`, `card-removal-animation`

## 4. Merge Filter Bar Specs

- [ ] 4.1 Create `filter-bar/filter-bar.md` by merging `filter-bar-refinement`, `filter-bar-responsive-layout`, `sticky-filter-bar`

## 5. Merge Settings Specs

- [ ] 5.1 Create `settings/ui.md` by merging `settings-toggle-switches`, `settings-bulk-toggle`, `settings-card-layout`
- [ ] 5.2 Create `settings/locale.md` by merging `app-locale-setting`, `i18n-infrastructure`
- [ ] 5.3 Move `settings-sync/spec.md` → `settings/sync.md`

## 6. Move Navigation Specs

- [ ] 6.1 Move `app-layout/spec.md` → `navigation/layout.md`
- [ ] 6.2 Move `client-side-routing/spec.md` → `navigation/routing.md`
- [ ] 6.3 Move `lazy-loading/spec.md` → `navigation/lazy-loading.md`
- [ ] 6.4 Move `read-list-badge/spec.md` → `navigation/read-list-badge.md`

## 7. Move and Merge Sync Specs

- [ ] 7.1 Move `supabase-auth/spec.md` → `sync/auth.md`
- [ ] 7.2 Move `sync-ui/spec.md` → `sync/ui.md`
- [ ] 7.3 Create `sync/storage.md` by merging `storage-pruning`, `theme-persistence`

## 8. Move and Merge UI Specs

- [ ] 8.1 Create `ui/polish.md` by merging `ui-polish`, `favicon-gradient`
- [ ] 8.2 Move `wcag-fixes/spec.md` → `ui/accessibility.md`
- [ ] 8.3 Move `error-boundary/spec.md` → `ui/error-handling.md`

## 9. Merge DevOps Specs

- [ ] 9.1 Create `devops/ci-cd.md` by merging `ci-cd-pipeline`, `release-artifacts`, `release-automation`
- [ ] 9.2 Create `devops/dx.md` by merging `dx-improvements`, `project-cleanup`
- [ ] 9.3 Create `devops/testing.md` by merging `e2e-testing`, `test-coverage-config`

## 10. Cleanup

- [ ] 10.1 Delete all 51 old spec directories from `openspec/specs/`
- [ ] 10.2 Verify all 27 new spec files exist in their domain folders
- [ ] 10.3 Verify no requirements were lost by comparing total requirement count before and after

## 11. Quality Gates

- [ ] 11.1 Run `npm run lint` and fix any issues
- [ ] 11.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 11.3 Run `npm run test` and fix any issues
- [ ] 11.4 Run `npm run test:e2e` and fix any issues
- [ ] 11.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 11.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
