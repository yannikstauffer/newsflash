# CI/CD

## From: ci-cd-pipeline/spec.md

## ADDED Requirements

### Requirement: CI workflow runs on pull requests and pushes
The CI workflow SHALL execute on every pull request targeting the `develop` or `master` branch, on every push to `develop`, and on every push to `master`.

#### Scenario: Pull request triggers CI
- **WHEN** a pull request is opened or updated targeting `develop` or `master`
- **THEN** the CI workflow MUST run all quality gate steps

#### Scenario: Push to develop triggers CI
- **WHEN** code is pushed directly to `develop`
- **THEN** the CI workflow MUST run all quality gate steps

#### Scenario: Push to master triggers CI
- **WHEN** code is pushed directly to `master`
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

### Requirement: Release workflow computes version from the last tag
The release workflow SHALL compute the new version by applying the bump type to the last tag's version, NOT by bumping the current `package.json` version.

#### Scenario: Version computed from tag
- **WHEN** the last tag is `v1.3.0` and the bump type is `minor`
- **THEN** the new version MUST be `1.4.0` regardless of what `package.json` currently contains

#### Scenario: Version unchanged from previous run
- **WHEN** the computed version matches the current `package.json` version
- **THEN** the workflow MUST skip the version bump commit and PR update

#### Scenario: Version changes due to new commit type
- **WHEN** the last tag is `v1.3.0`, `package.json` is `1.3.1` (from a previous fix), and a `feat:` commit arrives
- **THEN** the new version MUST be `1.4.0` and `package.json` MUST be updated

### Requirement: Release workflow bumps version in package.json on develop
The release workflow SHALL update `package.json` and `package-lock.json` with the computed version and commit to `develop`.

#### Scenario: Version bump committed to develop
- **WHEN** the computed version differs from `package.json`
- **THEN** a commit with message `chore: release v<version>` MUST be pushed directly to the `develop` branch
- **AND** the commit MUST include `package.json`, `package-lock.json`, and `CHANGELOG.md`

### Requirement: Release workflow generates CHANGELOG on develop
The release workflow SHALL generate or update `CHANGELOG.md` with entries grouped by conventional commit type and commit the update to `develop`.

#### Scenario: CHANGELOG includes grouped entries
- **WHEN** a release includes `feat:` and `fix:` commits
- **THEN** `CHANGELOG.md` MUST contain separate sections for "Features" and "Bug Fixes" with commit messages listed under each

#### Scenario: CHANGELOG is committed with version bump
- **WHEN** the CHANGELOG is generated
- **THEN** the CHANGELOG update MUST be included in the same commit as the version bump (`chore: release v<version>`)

### Requirement: Release workflow creates or updates a release PR
The release workflow SHALL maintain a single pull request from `develop` to `master`.

#### Scenario: No release PR exists
- **WHEN** no open PR exists with base `master` and head `develop`
- **THEN** the workflow MUST create a new PR with title `chore: release v<version>`

#### Scenario: Release PR already exists
- **WHEN** an open PR exists with base `master` and head `develop` and the version has changed
- **THEN** the workflow MUST update the PR title to `chore: release v<version>`

#### Scenario: Release PR exists and version unchanged
- **WHEN** an open PR exists and the computed version matches the PR title version
- **THEN** the workflow MUST NOT update the PR (the new commits appear automatically)

### Requirement: Release workflow does NOT build, test, or create artifacts
The release workflow SHALL NOT run build, lint, test, or artifact packaging steps. These are handled by the CI workflow.

#### Scenario: No build steps in release workflow
- **WHEN** the release workflow runs
- **THEN** it MUST NOT execute `npm run build`, `npm run test`, `npm run lint`, or any artifact packaging commands

### Requirement: Release workflow does NOT create tags or GitHub Releases
The release workflow SHALL NOT create git tags or GitHub Releases. These are handled by the release finalize workflow.

#### Scenario: No tag creation in release workflow
- **WHEN** the release workflow completes
- **THEN** no git tags SHALL have been created or pushed

### Requirement: Release workflow uses concurrency control
The release workflow SHALL use a concurrency group to ensure only one release runs at a time.

#### Scenario: Concurrent releases are queued
- **WHEN** a release workflow is triggered while another is already running
- **THEN** the new workflow MUST wait for the running one to complete before starting

### Requirement: Release workflow uses minimal permissions
The release workflow SHALL request `contents: write` and `pull-requests: write`.

#### Scenario: Workflow permissions are scoped
- **WHEN** the release workflow runs
- **THEN** it MUST declare `contents: write` and `pull-requests: write` permissions and no others

## From: release-finalization/spec.md

## Requirements

### Requirement: Release finalize triggers on release PR merge to master
The release finalize workflow SHALL trigger when a pull request from `develop` to `master` is merged.

#### Scenario: Release PR merged triggers finalize
- **WHEN** a PR with head `develop` and base `master` is merged
- **THEN** the release finalize workflow MUST be triggered

#### Scenario: Non-release PR does not trigger
- **WHEN** a PR from a branch other than `develop` is merged to `master`
- **THEN** the release finalize workflow MUST NOT execute

#### Scenario: Closed-without-merge does not trigger
- **WHEN** the release PR is closed without merging
- **THEN** the release finalize workflow MUST NOT execute

### Requirement: Release finalize extracts version from package.json
The release finalize workflow SHALL read the version from `package.json` at the merge commit.

#### Scenario: Version extracted from package.json
- **WHEN** the release finalize workflow runs
- **THEN** it MUST read the version from `package.json` (not from the branch name or PR title)

### Requirement: Release finalize creates a git tag on the merge commit
The release finalize workflow SHALL create and push a git tag `v<version>` on the merge commit SHA.

#### Scenario: Tag created on merge commit
- **WHEN** the release PR is merged with a merge commit
- **THEN** a tag `v<version>` MUST be created on the merge commit SHA
- **AND** the tag MUST be pushed to the remote

### Requirement: Release finalize creates a GitHub Release
The release finalize workflow SHALL create a GitHub Release with the tag and changelog-based release notes.

#### Scenario: GitHub Release created with changelog
- **WHEN** the tag is created
- **THEN** a GitHub Release MUST be created with title `v<version>` and body containing the CHANGELOG entries for this version

### Requirement: Release finalize does NOT attach artifacts
The release finalize workflow SHALL NOT attach any build artifacts to the GitHub Release.

#### Scenario: No artifacts on release
- **WHEN** a GitHub Release is created
- **THEN** it MUST NOT have any attached assets (no dist.tar.gz, no reports)

### Requirement: Release finalize uses minimal permissions
The release finalize workflow SHALL request only `contents: write`.

#### Scenario: Permissions are scoped
- **WHEN** the release finalize workflow runs
- **THEN** it MUST declare `contents: write` permission and no others
