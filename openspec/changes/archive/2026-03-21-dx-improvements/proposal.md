## Why

The pre-commit hook only runs `npm test` (unit tests) but does not run the linter. As a result, lint errors — particularly in E2E test files — go undetected until CI or manual review. The `i18next/no-literal-string` ESLint rule is enabled project-wide despite no i18n system being in place, forcing developers to add `eslint-disable` comments (6+ in `feed-config-page.tsx` alone). Additionally, `lint-staged` is installed as a dependency but has no configuration, so it provides no value.

These three issues (X1: uncaught E2E lint errors, X4: premature i18n rule friction, T6: lint-staged unconfigured) are bundled together because they all relate to developer experience friction in the lint/hook pipeline.

## What Changes

- Configure `lint-staged` in `package.json` to run ESLint on staged `.ts` and `.tsx` files.
- Update `.husky/pre-commit` to run `npx lint-staged` before `npm test`, so both linting and tests run on commit.
- Disable the `i18next/no-literal-string` rule in `eslint.config.mjs` until an i18n system is actually adopted.
- Fix existing lint errors in `tests-e2e/` files (import order, naming conventions) so the newly-enforced linting passes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- `.husky/pre-commit` — updated to invoke lint-staged alongside tests
- `package.json` — lint-staged configuration added
- `eslint.config.mjs` — `i18next/no-literal-string` rule disabled; i18next plugin import may be removed
- `tests-e2e/**/*.ts` — lint errors fixed (import order, naming, stylistic issues)
- `src/features/**/feed-config-page.tsx` — `eslint-disable` comments for i18next can be removed
