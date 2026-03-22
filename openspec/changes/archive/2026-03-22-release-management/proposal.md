## Why

There is no release management in place. The project has never been versioned (stuck at `0.0.0`), has no git tags, no GitHub Releases, and no way to produce a deployable snapshot with test evidence. CI runs checks but discards all artifacts. Setting up automated releases with test artifacts attached gives every release a verifiable, downloadable record of what was shipped and what was tested.

## What Changes

- **Add `release-please` GitHub Action** to automate version bumping, changelog generation, and GitHub Release creation based on conventional commits (already used in the project)
- **Enhance `ci.yml`** to produce and upload workflow artifacts: build output (`dist/`), Vitest test results (JUnit XML), coverage report (HTML), and Playwright report (HTML with screenshots)
- **Add `release.yml` workflow** that triggers when release-please's Release PR is merged, downloads CI artifacts, and attaches them to the GitHub Release
- **Add `release-please-config.json` and `.release-please-manifest.json`** for release-please configuration
- **CI trigger expansion**: add `develop` branch push trigger so CI runs on integration branch merges too, not just `main` and PRs
- **Auto-generate `CHANGELOG.md`** grouped by conventional commit type (feat, fix, etc.)

## Capabilities

### New Capabilities

- `release-automation`: Automated GitHub Release creation via release-please, triggered by merging to main. Includes version bumping in package.json, git tagging, changelog generation, and Release PR workflow.
- `release-artifacts`: Test and build artifacts attached to every GitHub Release — dist tarball, test results XML, coverage report, and Playwright report.

### Modified Capabilities

- `ci-cd-pipeline`: CI enhanced with artifact production (coverage report, test results XML, Playwright report, dist output) and upload steps. Trigger expanded to include `develop` branch pushes.

## Impact

- **New files**: `.github/workflows/release.yml`, `release-please-config.json`, `.release-please-manifest.json`
- **Modified files**: `.github/workflows/ci.yml`
- **Auto-managed files**: `CHANGELOG.md`, `package.json` (version field, by release-please)
- **Dependencies**: None (release-please is a GitHub Action, not an npm dependency)
- **New GitHub permissions**: `contents: write` and `pull-requests: write` for the release workflow
