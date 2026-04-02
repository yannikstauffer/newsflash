# CI/CD

## From: ci-cd-pipeline/spec.md

## ADDED Requirements

### Requirement: CI workflow runs on pull requests
The CI workflow SHALL execute on every pull request targeting the `main` or `develop` branch, on every push to `main`, and on every push to `develop`.

#### Scenario: Pull request triggers CI
- **WHEN** a pull request is opened or updated targeting `main` or `develop`
- **THEN** the CI workflow MUST run all quality gate steps

#### Scenario: Push to main triggers CI
- **WHEN** code is pushed directly to `main`
- **THEN** the CI workflow MUST run all quality gate steps

#### Scenario: Push to develop triggers CI
- **WHEN** code is pushed directly to `develop`
- **THEN** the CI workflow MUST run all quality gate steps

### Requirement: CI runs lint check
The CI workflow SHALL run ESLint via `npm run lint` and MUST fail the pipeline if any lint errors are found.

#### Scenario: Lint passes
- **WHEN** the CI workflow runs lint and there are no ESLint errors
- **THEN** the lint step MUST pass and the pipeline continues

#### Scenario: Lint fails
- **WHEN** the CI workflow runs lint and ESLint reports errors
- **THEN** the lint step MUST fail and the pipeline MUST report failure

### Requirement: CI runs production build with type checking
The CI workflow SHALL run `npm run build` which executes `tsc -b && vite build`, ensuring both TypeScript compilation and production bundle generation succeed.

#### Scenario: Build passes
- **WHEN** the CI workflow runs the build and there are no TypeScript or Vite errors
- **THEN** the build step MUST pass and the pipeline continues

#### Scenario: Build fails on type error
- **WHEN** the CI workflow runs the build and TypeScript reports a type error
- **THEN** the build step MUST fail and the pipeline MUST report failure

### Requirement: CI runs unit tests
The CI workflow SHALL run unit tests via `npm run test` (Vitest) and MUST fail the pipeline if any test fails.

#### Scenario: All tests pass
- **WHEN** the CI workflow runs tests and all unit tests pass
- **THEN** the test step MUST pass and the pipeline MUST report success

#### Scenario: A test fails
- **WHEN** the CI workflow runs tests and one or more unit tests fail
- **THEN** the test step MUST fail and the pipeline MUST report failure

### Requirement: CI uses dependency caching
The CI workflow SHALL cache npm dependencies to reduce install time on subsequent runs.

#### Scenario: Dependencies are cached
- **WHEN** the CI workflow runs and a cache exists from a previous run with the same lockfile
- **THEN** the npm install step MUST use the cached dependencies

### Requirement: CI produces test results as workflow artifacts
The CI workflow SHALL run unit tests with JUnit XML reporter and upload the results as a workflow artifact with 7-day retention.

#### Scenario: Test results uploaded on success
- **WHEN** the CI workflow completes and unit tests pass
- **THEN** a workflow artifact containing test results XML MUST be uploaded with 7-day retention

#### Scenario: Test results uploaded on failure
- **WHEN** the CI workflow completes and unit tests fail
- **THEN** a workflow artifact containing test results XML MUST still be uploaded (for debugging)

### Requirement: CI produces coverage report as workflow artifact
The CI workflow SHALL run unit tests with coverage enabled and upload the HTML coverage report as a workflow artifact with 7-day retention.

#### Scenario: Coverage report uploaded
- **WHEN** the CI workflow completes the test step
- **THEN** a workflow artifact containing the HTML coverage report MUST be uploaded with 7-day retention

### Requirement: CI produces Playwright report as workflow artifact
The CI workflow SHALL run Playwright E2E tests and upload the HTML report as a workflow artifact with 7-day retention.

#### Scenario: Playwright report uploaded on success
- **WHEN** the CI workflow completes and E2E tests pass
- **THEN** a workflow artifact containing the Playwright HTML report MUST be uploaded with 7-day retention

#### Scenario: Playwright report uploaded on failure
- **WHEN** the CI workflow completes and E2E tests fail
- **THEN** a workflow artifact containing the Playwright HTML report MUST still be uploaded (for debugging)

### Requirement: CI produces build output as workflow artifact
The CI workflow SHALL upload the production build output (`dist/`) as a workflow artifact with 7-day retention.

#### Scenario: Build output uploaded
- **WHEN** the CI workflow completes the build step successfully
- **THEN** a workflow artifact containing the `dist/` directory MUST be uploaded with 7-day retention

### Requirement: CI installs Playwright browsers
The CI workflow SHALL install Playwright browsers before running E2E tests.

#### Scenario: Playwright browsers are available
- **WHEN** the E2E test step runs
- **THEN** Playwright browsers MUST be installed and available for test execution

## From: release-artifacts/spec.md

## Requirements

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

### Requirement: Playwright traces are not attached to releases
Playwright trace files SHALL NOT be attached to GitHub Releases due to their size. They are only available as CI workflow artifacts.

#### Scenario: Traces excluded from release
- **WHEN** a GitHub Release is created
- **THEN** the release assets MUST NOT include Playwright trace files

## From: release-automation/spec.md

## Requirements

### Requirement: Release workflow triggers on successful CI completion on develop
The release workflow SHALL trigger via `workflow_run` when the CI workflow completes successfully on the `develop` branch.

#### Scenario: CI passes on develop triggers release
- **WHEN** the CI workflow completes successfully on a push to `develop`
- **THEN** the release workflow MUST be triggered

#### Scenario: CI fails on develop does not trigger release
- **WHEN** the CI workflow fails on a push to `develop`
- **THEN** the release workflow MUST NOT be triggered

#### Scenario: CI passes on master does not trigger release
- **WHEN** the CI workflow completes successfully on a push to `master`
- **THEN** the release workflow MUST NOT be triggered

### Requirement: Release workflow skips bot-triggered pushes
The release workflow SHALL skip execution when the push was made by `github-actions[bot]` to prevent infinite loops from version-bump commits.

#### Scenario: Bot push is skipped
- **WHEN** the release workflow is triggered and `github.actor` is `github-actions[bot]`
- **THEN** the workflow MUST exit without performing any release steps

#### Scenario: Human push proceeds
- **WHEN** the release workflow is triggered and `github.actor` is not `github-actions[bot]`
- **THEN** the workflow MUST proceed with release analysis

### Requirement: Release workflow analyzes commits since last tag
The release workflow SHALL scan all conventional commits between the latest `v*` tag and HEAD on `develop` to determine the release type.

#### Scenario: feat commit determines minor bump
- **WHEN** commits since the last tag include at least one `feat:` commit
- **THEN** the workflow MUST determine the bump type as `minor`

#### Scenario: fix commit determines patch bump
- **WHEN** commits since the last tag include `fix:` commits but no `feat:` or breaking commits
- **THEN** the workflow MUST determine the bump type as `patch`

#### Scenario: perf commit determines patch bump
- **WHEN** commits since the last tag include `perf:` commits but no `feat:` or breaking commits
- **THEN** the workflow MUST determine the bump type as `patch`

#### Scenario: refactor commit determines patch bump
- **WHEN** commits since the last tag include `refactor:` commits but no `feat:` or breaking commits
- **THEN** the workflow MUST determine the bump type as `patch`

#### Scenario: Breaking change determines major bump
- **WHEN** commits since the last tag include a commit with `!` suffix (e.g., `feat!:`) or a `BREAKING CHANGE:` footer
- **THEN** the workflow MUST determine the bump type as `major`

#### Scenario: Mixed commit types use highest bump
- **WHEN** commits since the last tag include multiple releasable types (e.g., `feat:` and `fix:`)
- **THEN** the workflow MUST use the highest bump type (major > minor > patch)

#### Scenario: Only non-releasable commits skip release
- **WHEN** all commits since the last tag are `docs:`, `test:`, or `chore:` types only
- **THEN** the workflow MUST skip the release and exit successfully without error

#### Scenario: No commits since last tag
- **WHEN** there are no commits between the last `v*` tag and HEAD
- **THEN** the workflow MUST skip the release and exit successfully

### Requirement: Release workflow bumps version in package.json
The release workflow SHALL update the `version` field in `package.json` to the new version number and commit the change to `develop`.

#### Scenario: Version is bumped in package.json
- **WHEN** the workflow determines a bump type of `patch`, `minor`, or `major`
- **THEN** `package.json` MUST be updated with the new version number

#### Scenario: Version bump is committed to develop
- **WHEN** the version is bumped in `package.json`
- **THEN** a commit with message `chore: release v<version>` MUST be pushed to the `develop` branch

### Requirement: Release workflow generates CHANGELOG
The release workflow SHALL generate or update `CHANGELOG.md` with entries grouped by conventional commit type, matching the section grouping: Features, Bug Fixes, Performance Improvements, Code Refactoring.

#### Scenario: CHANGELOG includes grouped entries
- **WHEN** a release includes `feat:` and `fix:` commits
- **THEN** `CHANGELOG.md` MUST contain separate sections for "Features" and "Bug Fixes" with commit messages listed under each

#### Scenario: CHANGELOG is committed with version bump
- **WHEN** the CHANGELOG is generated
- **THEN** the CHANGELOG update MUST be included in the same commit as the version bump (`chore: release v<version>`)

### Requirement: Release workflow fast-forward merges develop to master
The release workflow SHALL merge `develop` into `master` using fast-forward only (`--ff-only`).

#### Scenario: Fast-forward merge succeeds
- **WHEN** `master` is an ancestor of `develop`
- **THEN** `master` MUST be updated to point to the same commit as `develop` via fast-forward

#### Scenario: Fast-forward merge fails
- **WHEN** `master` has diverged from `develop` and fast-forward is not possible
- **THEN** the workflow MUST fail with a clear error message and MUST NOT create a release

### Requirement: Release workflow creates a git tag
The release workflow SHALL create and push a git tag in the format `v<version>` (e.g., `v1.2.0`).

#### Scenario: Tag is created after merge
- **WHEN** the fast-forward merge to `master` succeeds
- **THEN** a git tag `v<version>` MUST be created and pushed to the remote

### Requirement: Release workflow creates a GitHub Release
The release workflow SHALL create a GitHub Release associated with the new tag, with the CHANGELOG entries for this version as the release body.

#### Scenario: GitHub Release is created
- **WHEN** the tag is pushed
- **THEN** a GitHub Release MUST be created with title `v<version>` and body containing the CHANGELOG entries for this version

### Requirement: Release workflow attaches build artifacts
The release workflow SHALL build the project and attach artifacts to the GitHub Release: `dist.tar.gz`, `coverage-report.zip`, and `playwright-report.zip`.

#### Scenario: dist tarball is attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `dist.tar.gz` asset containing the production build output

#### Scenario: Coverage report is attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `coverage-report.zip` asset containing the HTML coverage report

#### Scenario: Playwright report is attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `playwright-report.zip` asset containing the Playwright HTML report

#### Scenario: Build failure prevents release
- **WHEN** the build or tests fail during the release workflow
- **THEN** the workflow MUST fail and no GitHub Release SHALL be created

### Requirement: Release workflow uses concurrency control
The release workflow SHALL use a concurrency group to ensure only one release runs at a time.

#### Scenario: Concurrent releases are queued
- **WHEN** a release workflow is triggered while another is already running
- **THEN** the new workflow MUST wait for the running one to complete before starting

### Requirement: Release workflow uses minimal permissions
The release workflow SHALL request only the GitHub token permissions it needs: `contents: write`.

#### Scenario: Workflow permissions are scoped
- **WHEN** the release workflow runs
- **THEN** it MUST declare `contents: write` permission and no others
