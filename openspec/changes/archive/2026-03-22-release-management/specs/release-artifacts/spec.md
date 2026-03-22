## ADDED Requirements

### Requirement: Production build is attached to releases
The release workflow SHALL build the production bundle and attach it as a tarball (`dist.tar.gz`) to the GitHub Release.

#### Scenario: dist tarball is attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `dist.tar.gz` asset containing the production build output

### Requirement: Test results XML is attached to releases
The release workflow SHALL run unit tests with JUnit XML output and attach the results file to the GitHub Release.

#### Scenario: Test results are attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a test results XML file as an asset

#### Scenario: Tests fail during release
- **WHEN** unit tests fail during the release workflow
- **THEN** the workflow MUST fail and no release assets SHALL be attached

### Requirement: Coverage report is attached to releases
The release workflow SHALL generate an HTML coverage report and attach it as a zip archive to the GitHub Release.

#### Scenario: Coverage report is attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `coverage-report.zip` asset containing the HTML coverage report

### Requirement: Playwright report is attached to releases
The release workflow SHALL run Playwright E2E tests and attach the HTML report (including screenshots) as a zip archive to the GitHub Release.

#### Scenario: Playwright report is attached
- **WHEN** a GitHub Release is created
- **THEN** the release MUST have a `playwright-report.zip` asset containing the Playwright HTML report with screenshots

#### Scenario: E2E tests fail during release
- **WHEN** Playwright tests fail during the release workflow
- **THEN** the workflow MUST fail and no release assets SHALL be attached

### Requirement: Playwright traces are not attached to releases
Playwright trace files SHALL NOT be attached to GitHub Releases due to their size. They are only available as CI workflow artifacts.

#### Scenario: Traces excluded from release
- **WHEN** a GitHub Release is created
- **THEN** the release assets MUST NOT include Playwright trace files
