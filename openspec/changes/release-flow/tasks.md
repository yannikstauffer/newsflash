## 1. Remove release-please

- [x] 1.1 Delete `release-please-config.json`
- [x] 1.2 Delete `.release-please-manifest.json`
- [x] 1.3 Remove release-please references from `package.json` if any dev dependencies exist

## 2. Rewrite release workflow

- [x] 2.1 Rewrite `.github/workflows/release.yml` with `workflow_run` trigger on CI completion for `develop` branch
- [x] 2.2 Add actor check to skip `github-actions[bot]` triggered runs
- [x] 2.3 Add concurrency group (`concurrency: release`) to prevent parallel releases
- [x] 2.4 Implement commit analysis step: scan commits since last `v*` tag, determine bump type (major/minor/patch/skip) based on conventional commit prefixes (`feat!:`→major, `feat:`→minor, `fix:/perf:/refactor:`→patch, `docs:/test:/chore:`→skip)
- [x] 2.5 Implement version bump step: run `npm version <bump>` with `--no-git-tag-version`, commit `package.json` + `CHANGELOG.md` as `chore: release v<version>`, push to `develop`
- [x] 2.6 Implement CHANGELOG generation step using `conventional-changelog-cli` (grouped sections: Features, Bug Fixes, Performance Improvements, Code Refactoring)
- [x] 2.7 Implement fast-forward merge step: `git merge --ff-only` develop into `master`, push `master`
- [x] 2.8 Implement tagging step: create and push `v<version>` tag
- [x] 2.9 Implement GitHub Release creation step using `gh release create` with CHANGELOG body
- [x] 2.10 Implement build + test + artifact packaging step: build, run tests with coverage + JUnit XML, run Playwright, package `dist.tar.gz`, `coverage-report.zip`, `playwright-report.zip`, `test-results.xml`
- [x] 2.11 Attach all artifacts to the GitHub Release
- [x] 2.12 Set workflow permissions to `contents: write` only

## 3. Update CI workflow

- [x] 3.1 Review `.github/workflows/ci.yml` and ensure it works correctly as a `workflow_run` source for the release workflow (no changes expected, but verify trigger events match)

## 4. Branch protection

- [x] 4.1 Document required branch protection rules for `master`: require PR (no direct pushes), require status checks to pass. Note: this is configured via GitHub repository settings, not via workflow files.

## 5. Quality Gates

- [x] 5.1 Run `npm run lint` and fix any issues
- [x] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 5.3 Run `npm run test` and fix any issues
- [x] 5.4 Run `npm run test:e2e` and fix any issues (Engadget connector flaky test — pre-existing, unrelated)
- [x] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
