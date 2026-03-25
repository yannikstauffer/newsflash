## ADDED Requirements

### Requirement: Connector E2E tests use live RSS feeds
The `connectors.spec.ts` tests SHALL NOT mock RSS feed requests. Tests SHALL rely on the Vite dev server proxy to fetch real XML from upstream feed URLs. Image requests SHALL still be mocked with a placeholder PNG.

#### Scenario: Connector smoke test hits real feed
- **WHEN** a connector smoke test runs for a given connector
- **THEN** the app SHALL fetch real RSS/Atom XML via the Vite proxy at `/api/rss/<feed-id>` without `page.route()` interception for RSS endpoints

#### Scenario: Each connector renders articles with thumbnails
- **WHEN** the smoke test runs for a connector
- **THEN** at least one `<article>` element SHALL be visible on the page
- **AND** if the connector has `allHaveImages: true`, each article SHALL contain a loaded `<img>` element

#### Scenario: Connectors without guaranteed images skip image assertion
- **WHEN** the smoke test runs for a connector with `allHaveImages: false` (e.g., ubergizmo)
- **THEN** the test SHALL only assert that articles render, not that all have images

### Requirement: feed.spec.ts is deleted
The `feed.spec.ts` file SHALL be removed. Its smoke test role (article card rendering, image loading) is covered by the live connector smoke tests.

#### Scenario: No feed.spec.ts in test suite
- **WHEN** the E2E suite is listed
- **THEN** `feed.spec.ts` SHALL NOT exist in `tests-e2e/`

### Requirement: E2E tests are enabled in release CI workflow
The release workflow SHALL run Playwright E2E tests as a quality gate before publishing release artifacts.

#### Scenario: Release workflow runs E2E tests
- **WHEN** a release is triggered via `release.yml`
- **THEN** the workflow SHALL install Playwright browsers and run `npm run test:e2e`

#### Scenario: Playwright report is attached to release
- **WHEN** E2E tests complete in the release workflow
- **THEN** `playwright-report.zip` SHALL be uploaded as a release asset

### Requirement: Scheduled workflow runs live connector tests weekly
A GitHub Actions workflow `e2e-live.yml` SHALL run `connectors.spec.ts` on a weekly schedule and on manual dispatch.

#### Scenario: Weekly scheduled run
- **WHEN** Thursday 04:00 UTC arrives
- **THEN** the `e2e-live.yml` workflow SHALL trigger and run `npx playwright test --project=chromium tests-e2e/connectors.spec.ts`

#### Scenario: Manual trigger
- **WHEN** a developer triggers `e2e-live.yml` via `workflow_dispatch` in GitHub UI
- **THEN** the workflow SHALL run the same live connector tests

#### Scenario: Workflow failure is visible via badge
- **WHEN** `e2e-live.yml` fails
- **THEN** the README badge SHALL show a failing (red) status

### Requirement: README displays live feed test badge
The `README.md` SHALL include a GitHub Actions status badge for the `e2e-live.yml` workflow.

#### Scenario: Badge URL is correct
- **WHEN** viewing `README.md`
- **THEN** it SHALL contain a badge image pointing to `https://github.com/yannikstauffer/newsflash/actions/workflows/e2e-live.yml/badge.svg`

### Requirement: E2E suite is reduced to ~20 tests
The E2E suite SHALL be trimmed to remove tests that duplicate unit-tested logic. Only integration paths that cannot be validated by unit tests alone SHALL remain.

#### Scenario: connectors.spec.ts has 7 parameterized smoke tests
- **WHEN** the test suite is listed
- **THEN** `connectors.spec.ts` SHALL contain exactly 7 tests (one per connector), running on Desktop Chrome only

#### Scenario: filter.spec.ts is consolidated to 2 tests
- **WHEN** the test suite is listed
- **THEN** `filter.spec.ts` SHALL contain 1 search flow test and 1 day navigation test, running on Desktop Chrome only

#### Scenario: article-actions.spec.ts is consolidated to 5 tests
- **WHEN** the test suite is listed
- **THEN** `article-actions.spec.ts` SHALL contain 3 desktop tests (hide+unhide flow, save+remove flow, empty read list) and 2 mobile swipe tests

#### Scenario: navigation.spec.ts is consolidated to 1 test
- **WHEN** the test suite is listed
- **THEN** `navigation.spec.ts` SHALL contain 1 test covering the full tab cycle (Feed → Read List → Settings → Feed)

#### Scenario: settings.spec.ts is consolidated to 4 tests
- **WHEN** the test suite is listed
- **THEN** `settings.spec.ts` SHALL contain 4 tests (language switch, language persistence, theme toggle, source disable/re-enable), running on Desktop Chrome only

### Requirement: Mobile Chrome project runs only for swipe tests
The Playwright mobile-chrome project SHALL be scoped to only run tests in `article-actions.spec.ts` that require touch/swipe interaction.

#### Scenario: Mobile project does not run non-swipe tests
- **WHEN** the Playwright suite runs
- **THEN** the mobile-chrome project SHALL only execute swipe gesture tests, not navigation, filter, settings, or connector tests

### Requirement: Connector E2E tests also run in regular CI
The `connectors.spec.ts` live tests SHALL run as part of the regular CI workflow (`ci.yml`) on push/PR, in addition to the weekly scheduled workflow.

#### Scenario: CI runs live connector tests
- **WHEN** a push or PR triggers `ci.yml`
- **THEN** `connectors.spec.ts` SHALL be included in the Playwright test run
