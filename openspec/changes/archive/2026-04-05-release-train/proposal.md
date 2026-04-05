## Why

The current release flow is fully automated (continuous deployment): every successful CI run on `develop` triggers a version bump, changelog, build, test, and a release branch PR back to develop — with tags and GitHub Releases created on merge. This has two problems: (1) there's no human gate before a release ships, meaning every merged PR is implicitly a release; (2) the `master` branch is unused — Vercel deploys from `develop` and tags land on `develop`, making `master` dead weight.

The desired model is a **release train**: a persistent PR from `develop` to `master` accumulates commits over time, version and changelog are kept up-to-date automatically, and a human decides when to cut a release by merging the PR. This gives the team a deliberate release decision point while keeping version management fully automated.

## What Changes

- **Release workflow** (`release.yml`): instead of building/testing/creating a release branch, it now only computes the version (from the last tag, not from `package.json`), bumps `package.json` + `CHANGELOG.md` on `develop`, and creates or updates a single long-lived PR from `develop` to `master`. Build and test steps are removed (CI already handles those).
- **Release finalize workflow** (`release-finalize.yml`): triggers when the release PR (develop → master) is merged via merge commit, creates a git tag on the merge commit, extracts release notes from `CHANGELOG.md`, and creates a GitHub Release. No artifacts are attached.
- **CI workflow** (`ci.yml`): adds `master` branch to push/PR triggers so CI runs on the release merge.
- **Vercel production branch**: moves from `develop` to `master`.
- **GitHub repo settings**: merge commits must be enabled for PRs to `master`.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `release-automation`: Replace per-push release branches with a persistent release PR (develop → master). Version is computed from last tag (not current `package.json`). No build/test/artifact steps — only version bump, changelog, and PR management.
- `release-finalization`: Trigger on develop→master merge instead of release-branch→develop. Create tag on merge commit. Create GitHub Release with changelog notes only (no artifacts). Remove artifact download step.
- `ci-cd-pipeline`: Add `master` branch to CI triggers.

## Impact

- `.github/workflows/release.yml` — Rewrite: remove build/test/artifact steps, add tag-based version computation, add PR create/update logic
- `.github/workflows/release-finalize.yml` — Rewrite: trigger on develop→master merge, tag merge commit, GitHub Release without artifacts
- `.github/workflows/ci.yml` — Minor: add `master` to branch triggers
- `openspec/specs/devops/ci-cd.md` — Spec updates for all changed requirements
