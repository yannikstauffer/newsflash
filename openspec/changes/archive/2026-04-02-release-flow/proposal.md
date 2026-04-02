## Why

The current release process uses release-please, which creates a Release PR on `master` that must be manually merged. This adds friction to every release — a human must review and merge an auto-generated PR even when CI has already validated the code. The goal is a fully automated flow: merge a feature to `develop`, and if CI passes, a release is cut automatically with no manual steps.

## What Changes

- **Remove release-please**: Delete `release-please-config.json`, `.release-please-manifest.json`, and the release-please-based workflow
- **New automated release workflow**: A GitHub Actions workflow that triggers on push to `develop`, analyzes conventional commits since the last tag, bumps the version, generates CHANGELOG, fast-forward merges to `master`, tags, and creates a GitHub Release with build artifacts
- **Version bump on develop**: The workflow commits the version bump (`package.json`) and CHANGELOG update directly to `develop` before merging to `master`
- **Commit-type-based release gating**: Only `feat:`, `fix:`, `perf:`, and `refactor:` commits trigger a release. `docs:`, `test:`, and `chore:` commits alone are skipped.
- **Branch protection on master**: Enforce no direct pushes to `master` so fast-forward merge is always possible

## Capabilities

### New Capabilities

- `release-automation`: Automated version bumping, CHANGELOG generation, fast-forward merge to master, tagging, and GitHub Release creation — triggered by every push to develop that contains releasable commits

### Modified Capabilities

- `devops/ci-cd`: Release workflow is replaced entirely; CI workflow trigger conditions and branch references may need adjustment. Release-please requirements are removed and replaced with the new automated release flow.

## Impact

- **Workflows**: `.github/workflows/release.yml` rewritten; `.github/workflows/ci.yml` may need minor trigger adjustments
- **Config files removed**: `release-please-config.json`, `.release-please-manifest.json`
- **Dependencies**: No new runtime dependencies; may use `conventional-commits-parser` or similar in the workflow for commit analysis
- **Branch protection**: `master` branch needs protection rules configured (no direct pushes)
- **Git history**: `master` will always be a fast-forward of `develop`, producing linear history
