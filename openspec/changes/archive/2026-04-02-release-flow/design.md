## Context

The project currently uses release-please to manage releases on `master`. Release-please watches for conventional commits, auto-creates a Release PR with version bump and CHANGELOG, and when that PR is manually merged, creates a GitHub Release with build artifacts. This requires a manual merge step for every release.

The existing CI workflow (`.github/workflows/ci.yml`) runs lint, build, unit tests, and Playwright E2E tests on every push/PR to `master` and `develop`. The release workflow (`.github/workflows/release.yml`) depends on release-please and runs a full build + test + asset packaging on release creation.

Current version is `1.1.0` tracked in `package.json` and `.release-please-manifest.json`.

## Goals / Non-Goals

**Goals:**
- Fully automated release on every merge to `develop` (no manual steps)
- Version derived from conventional commits since last tag
- CHANGELOG maintained in repo, grouped by commit type
- Fast-forward merge from `develop` to `master` for linear history
- GitHub Release with build artifacts (dist, coverage, Playwright reports)
- Block releases when CI fails

**Non-Goals:**
- Pre-release/RC versions (only stable releases)
- Multi-package monorepo support
- Deployment automation (only release creation)
- NPM publishing

## Decisions

### 1. Replace release-please with a custom GitHub Actions workflow

**Decision**: Remove release-please entirely and implement a single custom workflow.

**Rationale**: Release-please's core model (create a PR → human merges) conflicts with the goal of full automation. Reconfiguring release-please to watch `develop` would still require manually merging its PR. A custom workflow is simpler and directly implements the desired flow.

**Alternatives considered**:
- *Reconfigure release-please to auto-merge its own PR*: Fragile — requires auto-merge permissions, PATs, and still creates unnecessary PR churn.
- *Use semantic-release*: Full-featured but opinionated about branch model (expects releases from `master`). Would require significant configuration to match the develop→master flow.

### 2. Use `conventional-recommended-bump` for version determination

**Decision**: Use the `conventional-recommended-bump` package (from the conventional-changelog ecosystem) to analyze commits since the last tag and determine the bump type.

**Rationale**: Battle-tested, same logic release-please uses internally, understands conventional commit format natively.

**Custom override**: Treat `refactor:` as `patch` (same as `fix:`). Skip release for `docs:`, `test:`, `chore:` only commits.

### 3. Use `conventional-changelog-cli` for CHANGELOG generation

**Decision**: Use `conventional-changelog` to generate grouped CHANGELOG entries, matching the existing section grouping from `release-please-config.json`.

**Rationale**: Produces the same CHANGELOG format users are already familiar with. Same ecosystem as the bump tool.

### 4. Infinite loop prevention via actor check

**Decision**: Skip the release workflow when `github.actor == 'github-actions[bot]'`.

**Rationale**: The version-bump commit is pushed by the workflow using the default `GITHUB_TOKEN`, which sets the actor to `github-actions[bot]`. This is more reliable than commit-message-based filtering, since PR merge commits don't always reflect individual commit types.

### 5. Workflow coordination: CI must pass before release

**Decision**: The release workflow uses `needs: ci` to depend on the CI job, or triggers via `workflow_run` after CI completes successfully.

**Rationale**: Ensures no release is cut from broken code. Using `workflow_run` is cleaner — it keeps the release workflow separate and only triggers after CI succeeds on `develop`.

**Chosen approach**: `workflow_run` trigger on `ci.yml` completion for `develop` branch, with a success check.

### 6. Fast-forward merge with branch protection

**Decision**: Use `git merge --ff-only` to merge `develop` into `master`. Enforce branch protection on `master` to prevent direct pushes.

**Rationale**: Fast-forward ensures `master` is always a strict subset of `develop`, keeping history linear and making the merge deterministic. Branch protection is configured via GitHub repository settings (not via workflow).

### 7. Git operations use GITHUB_TOKEN

**Decision**: Use the default `GITHUB_TOKEN` for all git push, tag, and release operations.

**Rationale**: No PAT or deploy key needed. The `GITHUB_TOKEN` with `contents: write` permission can push commits, tags, and create releases. The actor will be `github-actions[bot]`, which also serves the infinite-loop prevention.

## Risks / Trade-offs

- **Risk: Fast-forward fails if master diverges** → Mitigation: Branch protection prevents direct pushes to master. If it somehow diverges, the workflow fails loudly and a human investigates.
- **Risk: Concurrent merges to develop create race conditions** → Mitigation: GitHub Actions runs workflows sequentially per branch by default via concurrency groups. Add explicit `concurrency: release` to ensure only one release runs at a time.
- **Risk: CHANGELOG conflicts on develop** → Mitigation: The version-bump commit includes the CHANGELOG change. Since releases are sequential (concurrency group), no conflicts occur.
- **Trade-off: No manual release gate** → Accepted. Every releasable merge to develop triggers a release. This is the desired behavior — CI is the quality gate.
- **Trade-off: refactor: triggers a patch release** → Accepted. User's explicit decision. Pure refactors get a version bump even though no user-facing behavior changes.
