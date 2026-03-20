## Context

The project uses Husky for git hooks and has `lint-staged` v16.4.0 installed but unconfigured. The pre-commit hook at `.husky/pre-commit` currently runs only `npm test` (Vitest unit tests). ESLint is fully configured with 100+ rules including accessibility, security, stylistic, and import-order rules, but none of this runs automatically on commit.

The `i18next/no-literal-string` rule is enabled at error level with `markupOnly: true`. There is no i18n system (no i18next runtime, no translation files, no `useTranslation` hook usage). The rule forces `eslint-disable` comments in any component that renders literal strings outside of `src/components/ui/` and `src/App.tsx` (which already have overrides).

The E2E test files in `tests-e2e/` have 10+ lint errors: import ordering (5 files), `unicorn/prevent-abbreviations` (2 instances), `no-empty-pattern` (2 instances), `unicorn/text-encoding-identifier-case` (1 instance), and an unused variable (1 instance). These go unnoticed because linting is not part of the commit flow.

## Goals / Non-Goals

**Goals:**

- Staged files are linted automatically before every commit via lint-staged.
- Unit tests continue to run on every commit.
- The i18next/no-literal-string rule stops producing false positives until an i18n system is adopted.
- All existing E2E test files pass linting.

**Non-Goals:**

- Adding an i18n system (that is a separate initiative).
- Running E2E tests in the pre-commit hook (too slow).
- Changing the pre-push hook (it already runs `tsc --noEmit`).
- Modifying CI pipeline configuration.

## Decisions

### D1: Use lint-staged for pre-commit linting (not a global `npm run lint`)

Running `npm run lint` checks the entire project on every commit, which is slow and unrelated to the staged changes. lint-staged is already installed and is purpose-built for this: it runs ESLint only on staged files.

**Configuration in `package.json`:**
```json
"lint-staged": {
  "*.{ts,tsx}": "eslint"
}
```

**Alternative considered:** Running `npm run lint` in pre-commit. Rejected because it lints all files regardless of what changed, adding unnecessary latency.

### D2: Keep `npm test` alongside lint-staged in pre-commit

The pre-commit hook will run both `npx lint-staged` and `npm test`. This ensures neither linting nor unit tests regress on commit.

**Hook order:** lint-staged first (fast, fail-fast on style issues), then `npm test`.

### D3: Disable i18next/no-literal-string entirely rather than broadening overrides

Rather than adding more file-level overrides (for features, pages, etc.), disable the rule globally. The rule has value only when an i18n system exists. When i18n is adopted, the rule can be re-enabled and violations fixed as part of that effort.

**Alternative considered:** Adding per-directory overrides for `src/features/`. Rejected because the root cause is not the override scope — it is that the rule is premature without an i18n runtime.

The `eslint-plugin-i18next` dependency and import will be kept in `eslint.config.mjs` so re-enabling the rule later is a one-line change.

### D4: Fix E2E lint errors directly rather than ignoring test files

The E2E files should follow the same code quality standards as the rest of the project. The errors are straightforward to fix (import reordering, renaming variables, removing unused bindings).

**Alternative considered:** Adding `tests-e2e/` to the ESLint `globalIgnores`. Rejected because the E2E tests benefit from lint rules (import order, naming conventions, unused variables).

## Risks / Trade-offs

- **[Risk] lint-staged adds ~2-3s to each commit** → Acceptable trade-off for catching lint errors before they reach the repository. Developers can skip with `--no-verify` in exceptional cases.
- **[Risk] Disabling i18next rule means literal strings accumulate** → When i18n is adopted, there will be a larger batch of strings to extract. This is acceptable because the alternative (maintaining eslint-disable comments) creates worse noise now.
- **[Risk] Security warnings in E2E helpers are left as warnings** → The `security/detect-object-injection` and `security/detect-non-literal-fs-filename` rules are at `warn` level and are false positives in a test helper context. They do not block commits and do not need fixing.
