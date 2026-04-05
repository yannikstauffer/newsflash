## 1. Rewrite release workflow

- [x] 1.1 Replace version computation: instead of `npm version $BUMP`, parse last `v*` tag version, apply semver bump, compare with `package.json`, skip if already correct
- [x] 1.2 Remove build, test, and artifact packaging steps (lines 113-188 of current `release.yml`)
- [x] 1.3 Remove release branch creation — commit version bump + CHANGELOG directly to `develop`
- [x] 1.4 Replace PR-to-develop logic with release PR management: detect existing PR via `gh pr list --base master --head develop --state open`, create if missing, update title if version changed
- [x] 1.5 Update permissions to `contents: write` and `pull-requests: write`

## 2. Rewrite release finalize workflow

- [x] 2.1 Change trigger from `pull_request[closed] on develop` to `pull_request[closed] on master`
- [x] 2.2 Change condition from `startsWith(github.head_ref, 'release/')` to `github.head_ref == 'develop'`
- [x] 2.3 Extract version from `package.json` instead of branch name
- [x] 2.4 Create tag on `github.event.pull_request.merge_commit_sha`
- [x] 2.5 Extract release notes from CHANGELOG.md (keep existing awk logic)
- [x] 2.6 Create GitHub Release with tag + release notes, no artifact attachments
- [x] 2.7 Remove artifact download step and all artifact-related steps

## 3. Update CI workflow

- [x] 3.1 Add `master` to the `push.branches` and `pull_request.branches` triggers in `ci.yml`

## 4. Update specs

- [x] 4.1 Update `openspec/specs/devops/ci-cd.md` — replace release-automation and release-artifacts sections with the new requirements from `specs/release-automation/spec.md` and `specs/release-finalization/spec.md`

## 5. Quality Gates

- [x] 5.1 Run `npm run lint` and fix any issues
- [x] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 5.3 Run `npm run test` and fix any issues
- [x] 5.4 Run `npm run test:e2e` and fix any issues
- [x] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
