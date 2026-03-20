## Why

There is no CI/CD configuration in the project. No GitHub Actions, no build pipeline, no automated deployment. The `sonar-project.properties` file exists but is nearly empty. Code quality checks only run locally via git hooks (husky + lint-staged), which can be bypassed with `--no-verify`. This means broken code can be merged without any server-side validation.

## What Changes

- Add a GitHub Actions CI workflow that runs on pull requests and pushes to main/develop
- The workflow will run: lint (`eslint .`), type-check (`tsc -b`), unit tests (`vitest run`), and production build (`tsc -b && vite build`)
- No deployment automation — that is a separate concern

## Capabilities

### New Capabilities

None. CI/CD is infrastructure, not application behavior. It does not introduce or modify any user-facing capability.

### Modified Capabilities

None. No existing spec-level requirements are changing.

## Impact

- New file: `.github/workflows/ci.yml`
- Potentially add or adjust `package.json` scripts if needed (current scripts are sufficient)
- All PRs to main/develop will be gated by CI passing
- No application code changes
