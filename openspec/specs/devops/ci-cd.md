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
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `dist.tar.gz` asset containing the production build output

### Requirement: Test results XML is attached to releases
The release workflow SHALL run unit tests with JUnit XML output and attach the results file to the GitHub Release.

#### Scenario: Test results are attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a test results XML file as an asset

#### Scenario: Tests fail during release
- **WHEN** unit tests fail during the release workflow
- **THEN** the workflow MUST fail and no release assets SHALL be attached

### Requirement: Coverage report is attached to releases
The release workflow SHALL generate an HTML coverage report and attach it as a zip archive to the GitHub Release.

#### Scenario: Coverage report is attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `coverage-report.zip` asset containing the HTML coverage report

### Requirement: Playwright report is attached to releases
The release workflow SHALL run Playwright E2E tests and attach the HTML report (including screenshots) as a zip archive to the GitHub Release.

#### Scenario: Playwright report is attached
- **WHEN** a GitHub Release is created
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

### Requirement: Release-please creates a Release PR on main
The release workflow SHALL use `google-github-actions/release-please-action` to automatically create and maintain a Release PR on the `main` branch whenever new conventional commits are pushed.

#### Scenario: Feature commit triggers Release PR creation
- **WHEN** a commit with prefix `feat:` is pushed to `main`
- **THEN** release-please MUST create a Release PR that bumps the minor version in `package.json` and updates `CHANGELOG.md`

#### Scenario: Fix commit triggers Release PR creation
- **WHEN** a commit with prefix `fix:` is pushed to `main`
- **THEN** release-please MUST create a Release PR that bumps the patch version in `package.json` and updates `CHANGELOG.md`

#### Scenario: Breaking change triggers major bump
- **WHEN** a commit with a `!` suffix on the type (e.g., `feat!:`) or a `BREAKING CHANGE:` footer is pushed to `main`
- **THEN** release-please MUST create a Release PR that bumps the major version in `package.json`

#### Scenario: Multiple commits accumulate in Release PR
- **WHEN** multiple conventional commits are pushed to `main` before the Release PR is merged
- **THEN** release-please MUST update the existing Release PR to include all accumulated changes in the changelog

### Requirement: Merging the Release PR creates a GitHub Release
When the release-please Release PR is merged, the workflow SHALL create a git tag and a GitHub Release with auto-generated release notes.

#### Scenario: Release PR merged successfully
- **WHEN** the release-please Release PR is merged to `main`
- **THEN** the workflow MUST create a git tag matching the version (e.g., `v0.1.0`) and a GitHub Release with the changelog as the release body

### Requirement: Changelog is auto-generated
release-please SHALL generate and maintain a `CHANGELOG.md` file in the repository root, grouped by conventional commit type.

#### Scenario: Changelog includes grouped entries
- **WHEN** a Release PR is created with `feat:` and `fix:` commits
- **THEN** `CHANGELOG.md` MUST contain separate sections for "Features" and "Bug Fixes" with the commit messages listed under each

### Requirement: Version is bumped in package.json
release-please SHALL update the `version` field in `package.json` to match the released version.

#### Scenario: Version field is updated
- **WHEN** the Release PR is created
- **THEN** the PR MUST include a change to `package.json` setting the `version` field to the new version number

### Requirement: Release-please configuration files exist
The repository SHALL contain `release-please-config.json` and `.release-please-manifest.json` in the root directory to configure release-please behavior.

#### Scenario: Configuration specifies Node release type
- **WHEN** release-please reads `release-please-config.json`
- **THEN** the release type MUST be set to `node` and the default branch MUST be `main`

#### Scenario: Manifest tracks current version
- **WHEN** release-please reads `.release-please-manifest.json`
- **THEN** it MUST find the current version of the package (starting at `0.0.0`)

### Requirement: Release workflow uses minimal permissions
The release workflow SHALL request only the GitHub token permissions it needs: `contents: write` and `pull-requests: write`.

#### Scenario: Workflow permissions are scoped
- **WHEN** the release workflow runs
- **THEN** it MUST declare `contents: write` and `pull-requests: write` permissions and no others
