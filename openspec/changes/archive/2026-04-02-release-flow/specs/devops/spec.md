## REMOVED Requirements

### Requirement: Release-please creates a Release PR on main
**Reason**: Replaced by the new automated release workflow that bumps versions and releases directly without a Release PR.
**Migration**: The new `release-automation` capability handles version bumping, CHANGELOG generation, and GitHub Release creation automatically on every successful CI run on `develop`.

### Requirement: Merging the Release PR creates a GitHub Release
**Reason**: No more Release PRs. GitHub Releases are created directly by the new release workflow after fast-forward merging `develop` to `master`.
**Migration**: GitHub Releases are now created automatically by the release workflow with the same artifacts.

### Requirement: Changelog is auto-generated
**Reason**: CHANGELOG generation is now handled by the new release workflow using `conventional-changelog`, not release-please.
**Migration**: Same CHANGELOG format and grouping, different tool.

### Requirement: Version is bumped in package.json
**Reason**: Version bumping is now handled by the new release workflow directly, not via release-please PR.
**Migration**: Version is bumped on `develop` via `npm version` in the release workflow.

### Requirement: Release-please configuration files exist
**Reason**: release-please is being removed entirely.
**Migration**: Delete `release-please-config.json` and `.release-please-manifest.json`. No replacement configuration files needed.

### Requirement: Release workflow uses minimal permissions
**Reason**: Replaced by the new release workflow's own permission declaration.
**Migration**: The new release workflow declares `contents: write` only (no longer needs `pull-requests: write` since no PR is created).

## MODIFIED Requirements

### Requirement: Production build is attached to releases
The release workflow SHALL build the production bundle and attach it as a tarball (`dist.tar.gz`) to the GitHub Release.

#### Scenario: dist tarball is attached
- **WHEN** a GitHub Release is created by the release workflow
- **THEN** the release MUST have a `dist.tar.gz` asset containing the production build output

### Requirement: Test results XML is attached to releases
The release workflow SHALL run unit tests with JUnit XML output and attach the results file to the GitHub Release.

#### Scenario: Test results are attached
- **WHEN** a GitHub Release is created by the release workflow
- **THEN** the release MUST have a test results XML file as an asset

#### Scenario: Tests fail during release
- **WHEN** unit tests fail during the release workflow
- **THEN** the workflow MUST fail and no release assets SHALL be attached

### Requirement: Coverage report is attached to releases
The release workflow SHALL generate an HTML coverage report and attach it as a zip archive to the GitHub Release.

#### Scenario: Coverage report is attached
- **WHEN** a GitHub Release is created by the release workflow
- **THEN** the release MUST have a `coverage-report.zip` asset containing the HTML coverage report

### Requirement: Playwright report is attached to releases
The release workflow SHALL run Playwright E2E tests and attach the HTML report (including screenshots) as a zip archive to the GitHub Release.

#### Scenario: Playwright report is attached
- **WHEN** a GitHub Release is created by the release workflow
- **THEN** the release MUST have a `playwright-report.zip` asset containing the Playwright HTML report with screenshots

#### Scenario: E2E tests fail during release
- **WHEN** Playwright tests fail during the release workflow
- **THEN** the workflow MUST fail and no release assets SHALL be attached
