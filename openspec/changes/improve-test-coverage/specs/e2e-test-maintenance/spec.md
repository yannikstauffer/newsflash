## ADDED Requirements

### Requirement: E2E tests are enabled in release CI workflow
The release workflow SHALL run Playwright E2E tests as a quality gate before publishing release artifacts.

#### Scenario: Release workflow runs E2E tests
- **WHEN** a release is triggered via `release.yml`
- **THEN** the workflow SHALL install Playwright browsers and run `npm run test:e2e`

#### Scenario: Playwright report is attached to release
- **WHEN** E2E tests complete in the release workflow
- **THEN** `playwright-report.zip` SHALL be uploaded as a release asset

### Requirement: E2E tests do not duplicate unit-tested logic
Each E2E test SHALL validate a user flow that spans multiple components or requires browser-level interaction. E2E tests SHALL NOT duplicate scenarios already covered by unit tests.

#### Scenario: Connector rendering tests are evaluated for redundancy
- **WHEN** reviewing `connectors.spec.ts`
- **THEN** tests that only verify article card field rendering (title, source, timestamp, description) SHALL be evaluated against `article-card.test.tsx` and `connectors.test.ts` unit coverage, and removed if fully redundant

#### Scenario: Filter logic tests are evaluated for redundancy
- **WHEN** reviewing `filter.spec.ts`
- **THEN** tests that only validate search filtering behavior SHALL be evaluated against `filter-articles.test.ts` unit coverage, keeping only tests that verify the full UI interaction (input → filtered display → clear)

### Requirement: E2E test suite remains focused on integration paths
The E2E suite SHALL cover these critical integration paths that cannot be validated by unit tests alone:

#### Scenario: Navigation flow is tested end-to-end
- **WHEN** reviewing E2E coverage
- **THEN** tab switching between Feed, Read List, and Settings SHALL be covered by E2E tests

#### Scenario: Article action flows are tested end-to-end
- **WHEN** reviewing E2E coverage
- **THEN** hide/save via hover buttons (desktop) and swipe gestures (mobile) SHALL be covered by E2E tests

#### Scenario: Settings persistence is tested end-to-end
- **WHEN** reviewing E2E coverage
- **THEN** language switching, theme toggling, and source enable/disable with page reload SHALL be covered by E2E tests

#### Scenario: Cross-component data flow is tested
- **WHEN** reviewing E2E coverage
- **THEN** flows where actions in one component affect another (e.g., disabling a source in Settings removes articles from Feed) SHALL be covered by E2E tests
