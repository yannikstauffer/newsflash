# Release Finalization

## CHANGED Requirements

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

## REMOVED Requirements

### ~~Requirement: Release finalize downloads artifacts from release workflow~~
Removed. No artifacts are attached to GitHub Releases.

### ~~Requirement: Release finalize extracts version from branch name~~
Removed. Version is now read from `package.json`, not from a `release/vX.Y.Z` branch name.

### ~~Requirement: Production build is attached to releases~~
Removed.

### ~~Requirement: Test results XML is attached to releases~~
Removed.

### ~~Requirement: Coverage report is attached to releases~~
Removed.

### ~~Requirement: Playwright report is attached to releases~~
Removed.
