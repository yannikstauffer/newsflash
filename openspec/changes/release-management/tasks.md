## 1. Release-please Configuration

- [x] 1.1 Create `release-please-config.json` in repo root with release type `node`, default branch `main`, and changelog sections grouped by conventional commit type
- [x] 1.2 Create `.release-please-manifest.json` in repo root with initial version `0.0.0`

## 2. Enhance CI Workflow

- [x] 2.1 Add `develop` branch to push triggers in `ci.yml`
- [x] 2.2 Add Vitest coverage and JUnit XML reporter to the test step (`npm run test:coverage` with `--reporter=junit --outputFile=test-results.xml`)
- [x] 2.3 Add Playwright browser install step and E2E test step (`npm run test:e2e`)
- [x] 2.4 Add `actions/upload-artifact` steps for: test results XML, coverage HTML report, Playwright HTML report, and dist output — all with 7-day retention
- [x] 2.5 Ensure artifact upload steps run even on test failure (use `if: always()` or `if: success() || failure()`)

## 3. Release Workflow

- [x] 3.1 Create `.github/workflows/release.yml` with push-to-main trigger and `contents: write` + `pull-requests: write` permissions
- [x] 3.2 Add release-please action step that creates/updates the Release PR
- [x] 3.3 Add conditional steps (gated on `release_created` output) to: install dependencies, build, run tests with coverage and JUnit output, run Playwright E2E tests
- [x] 3.4 Add steps to tar the dist output and zip coverage + Playwright reports
- [x] 3.5 Add step to attach `dist.tar.gz`, `test-results.xml`, `coverage-report.zip`, and `playwright-report.zip` to the GitHub Release using `gh release upload` or `softprops/action-gh-release`

## 4. Vitest Reporter Configuration

- [x] 4.1 Add `vitest-junit-reporter` or configure Vitest's built-in JUnit reporter in `vitest.config.ts` to output `test-results.xml`
- [x] 4.2 Verify `npm run test:coverage` produces an HTML coverage report in a known output directory

## 5. Verification

- [x] 5.1 Verify all new and modified workflow files are valid YAML with correct GitHub Actions syntax
- [x] 5.2 Verify release-please config files are valid JSON
