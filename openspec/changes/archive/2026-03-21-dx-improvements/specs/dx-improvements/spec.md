## ADDED Requirements

### Requirement: Pre-commit hook runs linting on staged files
The pre-commit hook SHALL run ESLint on all staged `.ts` and `.tsx` files via lint-staged before running unit tests. If any staged file has lint errors, the commit SHALL be blocked.

#### Scenario: Staged file with lint error
- **WHEN** a developer commits a `.ts` or `.tsx` file that has an ESLint error
- **THEN** the pre-commit hook exits with a non-zero status and the commit is rejected

#### Scenario: Staged file with no lint errors
- **WHEN** a developer commits `.ts` and `.tsx` files that pass ESLint
- **THEN** lint-staged exits successfully and unit tests run next

#### Scenario: Non-TypeScript staged files
- **WHEN** a developer commits only non-TypeScript files (e.g., `.md`, `.json`, `.css`)
- **THEN** lint-staged skips linting and unit tests run as usual

### Requirement: Unit tests continue running on pre-commit
The pre-commit hook SHALL continue running `npm test` (Vitest) after lint-staged completes. Both lint and test gates MUST pass for a commit to succeed.

#### Scenario: Lint passes but tests fail
- **WHEN** staged files pass linting but a unit test fails
- **THEN** the commit is rejected

#### Scenario: Both lint and tests pass
- **WHEN** staged files pass linting and all unit tests pass
- **THEN** the commit succeeds

### Requirement: i18next literal string rule is disabled
The `i18next/no-literal-string` ESLint rule SHALL be disabled (`"off"`) in the ESLint configuration. Existing `eslint-disable` comments for this rule SHALL be removed.

#### Scenario: Component renders literal string without eslint-disable
- **WHEN** a developer writes JSX with a literal string in a component outside `src/components/ui/`
- **THEN** ESLint does not report an `i18next/no-literal-string` error

### Requirement: E2E test files pass linting
All files in `tests-e2e/` SHALL pass ESLint with zero errors. Existing import order, naming convention, unused variable, and encoding case errors SHALL be fixed.

#### Scenario: E2E files linted
- **WHEN** ESLint runs on `tests-e2e/**/*.ts`
- **THEN** zero errors are reported (warnings are acceptable)
