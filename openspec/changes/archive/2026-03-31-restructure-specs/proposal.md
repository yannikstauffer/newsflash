## Why

The `openspec/specs/` directory contains 51 flat spec files with no grouping or hierarchy. Granularity is inconsistent — some specs describe full features while others describe a single CSS property. Related specs are split across multiple files (e.g., three separate filter-bar specs, three swipe specs), and test-only specs masquerade as capabilities. Finding and understanding specs is difficult, and the flat structure doesn't scale.

## What Changes

- Reorganize 51 flat specs into 27 specs grouped under 9 domain folders
- Merge related micro-specs into cohesive feature specs (e.g., `swipe-gesture-detection` + `swipe-reveal-background` + `card-removal-animation` → `article-card/swipe.md`)
- Dissolve test-only specs (`hook-unit-tests`, `feed-page-hook-tests`) into their parent feature specs as requirements
- Move standalone specs into their domain folder without content changes
- Delete all old flat spec directories after migration

## Capabilities

### New Capabilities

- `feed/connectors`: Unified connector system spec — connector interface, folder structure, article filters, connector e2e testing
- `feed/filtering`: Feed filtering and orchestration — filter logic, feed configuration, page orchestration, related hook tests
- `feed/proxy`: Feed proxy — dev proxy and production Vercel edge proxy
- `article-card/layout`: Article card layout — card design, description clamping, mobile layout
- `article-card/content`: Article card content processing — image extraction, HTML sanitization
- `article-card/actions`: Article actions — article IDs, bulk actions (Hide All)
- `article-card/swipe`: Swipe gesture system — gesture detection, reveal background, removal animation
- `filter-bar/filter-bar`: Filter bar — layout, responsive behavior, sticky positioning
- `settings/ui`: Settings page UI — toggle switches, bulk toggle, card layout
- `settings/locale`: Localization — app locale setting, i18n infrastructure
- `sync/storage`: Sync storage — storage pruning, theme persistence
- `ui/polish`: UI polish — spacing, favicon
- `devops/ci-cd`: CI/CD pipeline — CI workflow, release artifacts, release automation
- `devops/dx`: Developer experience — pre-commit hooks, project cleanup
- `devops/testing`: Testing infrastructure — e2e config, coverage config

### Modified Capabilities

_(No requirement changes — this is a pure structural reorganization. All existing requirements are preserved as-is in their new locations.)_

## Impact

- **Spec files only** — no application code changes
- All 51 existing spec directories under `openspec/specs/` will be deleted
- 27 new spec files created under 9 domain subdirectories
- No changes to `openspec/changes/` (archives) or `openspec/config.yaml`
- Any tooling that references spec paths by name will need to use the new paths
