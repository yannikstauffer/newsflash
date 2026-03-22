## Context

The project has a single CI workflow (`ci.yml`) that runs lint, build, and test on PRs to main/develop and pushes to main. There is no versioning, no releases, no artifact collection. The project uses conventional commit prefixes (`feat:`, `fix:`, `docs:`, etc.) consistently. The branching model is feature → develop → main, where merging to main signals a release.

## Goals / Non-Goals

**Goals:**
- Automated GitHub Releases triggered by merging to main, with zero manual version management
- Every release includes downloadable test evidence (coverage, test results, Playwright report) and the build output
- Version bumping and changelog generation driven by conventional commits
- A human checkpoint (Release PR) before the release is actually cut

**Non-Goals:**
- Publishing to npm or any package registry
- Deployment automation (deploying the built app somewhere)
- Branch protection rules or required status checks configuration
- Monorepo or multi-package release management

## Decisions

### Decision 1: release-please over semantic-release

**Choice:** Google's `release-please` GitHub Action.

**Alternatives considered:**
- `semantic-release`: Fully automatic — every merge to main immediately creates a release. No human checkpoint, no changelog preview. Heavier plugin ecosystem.
- Manual tagging: Push `vX.Y.Z` tags manually. Simple but error-prone, no changelog generation, version drift risk.
- GitHub "Create Release" UI: Fully manual, no automation.

**Rationale:** release-please creates a Release PR that accumulates changes and shows the changelog preview before anything is published. This gives a natural review point without sacrificing automation. It's lighter than semantic-release and needs no npm plugins.

### Decision 2: Two-workflow architecture

**Choice:** Separate `ci.yml` (quality gates + artifact production) and `release.yml` (release-please + artifact attachment).

**Rationale:** CI must run on all branches and PRs. Release logic only runs on main. Separating them keeps CI fast and focused, and avoids conditional complexity in a single workflow. The release workflow downloads artifacts produced by CI rather than re-running tests.

### Decision 3: Artifact transfer via workflow artifacts

**Choice:** CI uploads build/test artifacts using `actions/upload-artifact`. The release workflow downloads them using `actions/download-artifact` when attaching to the GitHub Release.

**Alternative considered:** Re-running build and tests in the release workflow. Rejected because it wastes CI minutes, could produce different results, and the artifacts wouldn't match what was actually tested.

**Constraint:** Workflow artifacts are only available within the same workflow run by default. Since CI and release are separate workflows, the release workflow will need to build artifacts itself on release creation, or CI artifacts need to be passed cross-workflow. The simplest approach: the release workflow runs its own build + test steps when a release is created (release-please emits an output flag), ensuring artifacts match exactly the released commit.

### Decision 4: Artifact selection for releases

**Choice:** Attach these artifacts to each GitHub Release:
- `dist.tar.gz` — production build output, deployable snapshot
- `test-results.xml` — JUnit XML from Vitest, machine-readable pass/fail evidence
- `coverage-report.zip` — HTML coverage report from Vitest, browsable
- `playwright-report.zip` — Playwright HTML report with screenshots

**Not attached:** Playwright traces (10-50MB per test, useful for debugging but too large for release artifacts). These are uploaded as workflow artifacts with short retention (7 days) for CI debugging only.

### Decision 5: CI produces artifacts on all runs

**Choice:** Enhanced CI always produces and uploads artifacts (coverage, test results, Playwright report, dist), even on PRs and develop pushes.

**Rationale:** Artifacts are useful for PR review (check coverage, inspect Playwright screenshots) even when no release is being created. Upload with 7-day retention to avoid storage bloat.

### Decision 6: release-please configuration

**Choice:** Use manifest-based configuration with `release-please-config.json` and `.release-please-manifest.json` in the repo root.

**Settings:**
- Release type: `node` (bumps `package.json` version)
- Default branch: `main`
- Changelog sections: grouped by conventional commit type
- Include component name: no (single-package repo)
- Bootstrap version: `0.0.0` in manifest (release-please starts from current version)

## Risks / Trade-offs

**[Two-commit dance on main]** → Every release involves two merges to main: the feature merge from develop, then the release-please version bump PR. This is standard release-please behavior and expected. Teams unfamiliar with it may find it confusing.

**[Artifact size growth]** → Playwright reports with screenshots can grow as E2E tests expand. Mitigation: only attach the HTML report (not traces), monitor release asset sizes over time.

**[Release-please bot permissions]** → The release workflow needs `contents: write` and `pull-requests: write`. These are standard for release automation but should use the default `GITHUB_TOKEN` (no PAT needed) scoped to the repository.

**[Develop-to-main gap]** → If multiple features merge to develop but only one develop-to-main merge happens, the release includes all accumulated changes. This is the desired behavior (batched releases) but means individual feature PRs don't map 1:1 to releases.

**[Initial version]** → The project starts at `0.0.0`. The first release-please PR will bump to `0.1.0` (if it finds a `feat:` commit) or `0.0.1` (if only `fix:` commits). No special bootstrapping needed.
