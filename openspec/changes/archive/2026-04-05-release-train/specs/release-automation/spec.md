# Release Automation

## CHANGED Requirements

### Requirement: Release workflow triggers on successful CI completion on develop
The release workflow SHALL trigger via `workflow_run` when the CI workflow completes successfully on the `develop` branch.

> **Unchanged** — same trigger as before.

### Requirement: Release workflow skips bot-triggered pushes
The release workflow SHALL skip execution when the push was made by `github-actions[bot]` to prevent infinite loops from version-bump commits.

> **Unchanged** — same bot-actor guard.

### Requirement: Release workflow analyzes commits since last tag
The release workflow SHALL scan all conventional commits between the latest `v*` tag and HEAD on `develop` to determine the release type.

> **Unchanged** — same commit analysis logic (feat → minor, fix/perf/refactor → patch, breaking → major, chore/docs/test → skip).

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

> **Unchanged** — same changelog generation, but now committed to develop (not a release branch).

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
> **Unchanged** — same concurrency group `release` with `cancel-in-progress: false`.

### Requirement: Release workflow uses minimal permissions
The release workflow SHALL request `contents: write` and `pull-requests: write`.

#### Scenario: Workflow permissions are scoped
- **WHEN** the release workflow runs
- **THEN** it MUST declare `contents: write` and `pull-requests: write` permissions and no others

## REMOVED Requirements

### ~~Requirement: Release workflow fast-forward merges develop to master~~
Removed. The merge to master is now a manual action via the PR merge button (merge commit strategy).

### ~~Requirement: Release workflow creates a git tag~~
Removed. Tags are created by the release finalize workflow after the PR is merged.

### ~~Requirement: Release workflow creates a GitHub Release~~
Removed. GitHub Releases are created by the release finalize workflow.

### ~~Requirement: Release workflow attaches build artifacts~~
Removed. No artifacts are attached to GitHub Releases.
