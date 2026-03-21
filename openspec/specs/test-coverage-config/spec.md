## ADDED Requirements

### Requirement: Vitest coverage provider is configured

The project SHALL use `@vitest/coverage-v8` as the Vitest coverage provider, configured in `vitest.config.ts` under `test.coverage`.

#### Scenario: Coverage provider is set to v8

- **WHEN** `vitest.config.ts` is loaded
- **THEN** `test.coverage.provider` SHALL be `"v8"`

### Requirement: Coverage thresholds enforce 80% minimum

The coverage configuration SHALL enforce minimum thresholds of 80% for lines, branches, and functions. Running `vitest run --coverage` SHALL fail if any threshold is not met.

#### Scenario: All thresholds pass

- **WHEN** `vitest run --coverage` completes and line, branch, and function coverage are each at or above 80%
- **THEN** the command SHALL exit with code 0

#### Scenario: A threshold is not met

- **WHEN** `vitest run --coverage` completes and any of line, branch, or function coverage is below 80%
- **THEN** the command SHALL exit with a non-zero code and report which threshold failed

### Requirement: Coverage script exists in package.json

A dedicated npm script SHALL exist for running tests with coverage.

#### Scenario: Running coverage via npm

- **WHEN** a developer runs `npm run test:coverage`
- **THEN** Vitest SHALL execute all tests with coverage enabled and threshold enforcement

### Requirement: Coverage excludes non-source files

The coverage configuration SHALL exclude test files, configuration files, type declaration files, and the `src/components/ui/` directory (third-party shadcn components) from coverage measurement.

#### Scenario: Test files are excluded from coverage

- **WHEN** coverage is measured
- **THEN** files matching `**/*.test.*`, `**/*.spec.*`, `vitest.config.ts`, `**/*.d.ts`, and `src/components/ui/**` SHALL NOT count toward coverage totals
