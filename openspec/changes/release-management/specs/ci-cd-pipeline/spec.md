## MODIFIED Requirements

### Requirement: CI workflow runs on pull requests
The CI workflow SHALL execute on every pull request targeting the `main` or `develop` branch, on every push to `main`, and on every push to `develop`.

#### Scenario: Pull request triggers CI
- **WHEN** a pull request is opened or updated targeting `main` or `develop`
- **THEN** the CI workflow MUST run all quality gate steps

#### Scenario: Push to main triggers CI
- **WHEN** code is pushed directly to `main`
- **THEN** the CI workflow MUST run all quality gate steps

#### Scenario: Push to develop triggers CI
- **WHEN** code is pushed directly to `develop`
- **THEN** the CI workflow MUST run all quality gate steps

## ADDED Requirements

### Requirement: CI produces test results as workflow artifacts
The CI workflow SHALL run unit tests with JUnit XML reporter and upload the results as a workflow artifact with 7-day retention.

#### Scenario: Test results uploaded on success
- **WHEN** the CI workflow completes and unit tests pass
- **THEN** a workflow artifact containing test results XML MUST be uploaded with 7-day retention

#### Scenario: Test results uploaded on failure
- **WHEN** the CI workflow completes and unit tests fail
- **THEN** a workflow artifact containing test results XML MUST still be uploaded (for debugging)

### Requirement: CI produces coverage report as workflow artifact
The CI workflow SHALL run unit tests with coverage enabled and upload the HTML coverage report as a workflow artifact with 7-day retention.

#### Scenario: Coverage report uploaded
- **WHEN** the CI workflow completes the test step
- **THEN** a workflow artifact containing the HTML coverage report MUST be uploaded with 7-day retention

### Requirement: CI produces Playwright report as workflow artifact
The CI workflow SHALL run Playwright E2E tests and upload the HTML report as a workflow artifact with 7-day retention.

#### Scenario: Playwright report uploaded on success
- **WHEN** the CI workflow completes and E2E tests pass
- **THEN** a workflow artifact containing the Playwright HTML report MUST be uploaded with 7-day retention

#### Scenario: Playwright report uploaded on failure
- **WHEN** the CI workflow completes and E2E tests fail
- **THEN** a workflow artifact containing the Playwright HTML report MUST still be uploaded (for debugging)

### Requirement: CI produces build output as workflow artifact
The CI workflow SHALL upload the production build output (`dist/`) as a workflow artifact with 7-day retention.

#### Scenario: Build output uploaded
- **WHEN** the CI workflow completes the build step successfully
- **THEN** a workflow artifact containing the `dist/` directory MUST be uploaded with 7-day retention

### Requirement: CI installs Playwright browsers
The CI workflow SHALL install Playwright browsers before running E2E tests.

#### Scenario: Playwright browsers are available
- **WHEN** the E2E test step runs
- **THEN** Playwright browsers MUST be installed and available for test execution
