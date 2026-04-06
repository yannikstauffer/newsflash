## Architecture

The release system consists of three GitHub Actions workflows forming a pipeline:

```
  push to develop
        │
        ▼
   ┌─────────┐
   │   CI    │  lint, build, test (existing)
   └────┬────┘
        │ success (workflow_run)
        ▼
  ┌───────────────────────┐
  │   Release Workflow    │
  │                       │
  │ 1. Find last v* tag   │
  │ 2. Analyze commits    │──── no releasable commits ──▶ done
  │ 3. Compute version    │
  │ 4. Bump package.json  │
  │ 5. Update CHANGELOG   │
  │ 6. Commit to develop  │
  │ 7. Create/update PR   │
  │    (develop → master) │
  └───────────────────────┘
        │
        │  bot commit on develop → CI runs, Release skips (bot actor check)
        │
        ▼
  ┌───────────────────────────────────┐
  │   Release PR (develop → master)  │
  │   Title: "chore: release v1.4.0" │
  │   Accumulates commits over time  │
  │   Merge strategy: merge commit   │
  └──────────────────┬────────────────┘
                     │  human merges
                     ▼
  ┌───────────────────────────┐
  │   Release Finalize        │
  │                           │
  │ 1. Create tag v1.4.0     │
  │    on merge commit        │
  │ 2. Extract CHANGELOG      │
  │ 3. Create GitHub Release  │
  └───────────────────────────┘
```

## Key Design Decisions

### Version computation from tag, not package.json

The version is always computed by applying the bump type to the last tag version, NOT by running `npm version <bump>` on the current `package.json`. This handles the case where consecutive pushes change the bump level:

```
Tag v1.3.0 exists

  fix: typo       → compute: patch on 1.3.0 = 1.3.1 → update package.json
  fix: button     → compute: patch on 1.3.0 = 1.3.1 → already correct, skip
  feat: dashboard → compute: minor on 1.3.0 = 1.4.0 → update package.json
```

Implementation: parse the tag version, determine bump type from all commits since that tag, apply semver bump, compare with current `package.json`, only commit if different.

### Release PR lifecycle

1. **Creation**: first releasable commit after a release (or ever) creates a new PR
2. **Updates**: subsequent releasable commits update the PR title if the version changed
3. **Merge**: human merges via GitHub UI using merge commit
4. **Closure**: PR closes on merge, next releasable commit creates a new one
5. **Detection**: find existing PR via `gh pr list --base master --head develop`

### Merge commit as release marker

Using merge commits (not squash or rebase) for the release PR because:
- Each merge commit on `master` IS a release — `git log --first-parent master` shows all releases
- Tags are placed on the merge commit (exists only on master)
- `git revert -m 1 <merge>` cleanly reverts an entire release
- Git correctly computes merge base for the next release PR (no SHA divergence)
- Native GitHub PR support, no workarounds needed

### No build/test in release workflow

CI already runs lint, build, unit tests, and E2E tests on every push to develop. The release workflow only does version management. This eliminates the duplicate build/test that existed in the old flow.

### No artifacts on GitHub Releases

GitHub Releases contain only the tag and changelog-based release notes. Build artifacts are available as CI workflow artifacts (7-day retention) but are not attached to releases.

### Bot loop prevention

The version bump commit by `github-actions[bot]` triggers CI (unavoidable) but the release workflow skips bot-triggered runs via the existing actor check. The commit message `chore: release vX.Y.Z` is non-releasable anyway (chore type), providing double protection.

### Concurrency

The release workflow uses `concurrency: { group: release, cancel-in-progress: false }` to ensure version bumps are serialized. Two rapid pushes to develop won't race on the version computation.

## Permissions

| Workflow | Permissions needed |
|----------|-------------------|
| CI | Default (read) |
| Release | `contents: write`, `pull-requests: write` |
| Release Finalize | `contents: write` |
