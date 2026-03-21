## 1. Configure lint-staged

- [x] 1.1 Add `lint-staged` configuration to `package.json` with `"*.{ts,tsx}": "eslint"` rule
- [x] 1.2 Update `.husky/pre-commit` to run `npx lint-staged` before `npm test`

## 2. Disable i18next/no-literal-string rule

- [x] 2.1 Set `i18next/no-literal-string` to `"off"` in the base config block of `eslint.config.mjs`
- [x] 2.2 Remove the `i18next/no-literal-string` override block for `src/components/ui/**` and `src/App.tsx` (no longer needed when rule is off globally)
- [x] 2.3 Remove all `eslint-disable-next-line i18next/no-literal-string` comments from `src/features/feed-config/components/feed-config-page.tsx`

## 3. Fix E2E lint errors

- [x] 3.1 Fix import order in `tests-e2e/article-actions.spec.ts`, `feed.spec.ts`, `filter.spec.ts`, `navigation.spec.ts`, `settings.spec.ts` (move `./helpers/local-storage` before `./helpers/mock-feeds`)
- [x] 3.2 Fix import order in `tests-e2e/helpers/connector-setup.ts` (move `./mock-feeds` and `./local-storage` before type import of `@playwright/test`)
- [x] 3.3 Rename loop variable `i` to `index` in `tests-e2e/connectors.spec.ts` (2 instances)
- [x] 3.4 Fix empty object pattern destructuring in `tests-e2e/article-actions.spec.ts` (2 instances)
- [x] 3.5 Remove or prefix unused variable `firstTitle` in `tests-e2e/article-actions.spec.ts`
- [x] 3.6 Fix encoding identifier `utf-8` to `utf8` in `tests-e2e/helpers/mock-feeds.ts`

## 4. Verify

- [x] 4.1 Run `npx eslint tests-e2e/` and confirm zero errors
- [x] 4.2 Run `npx eslint src/` and confirm no new errors
- [x] 4.3 Run `npm test` and confirm all unit tests pass
- [x] 4.4 Test the pre-commit hook by making a test commit
