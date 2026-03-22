## ADDED Requirements

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
