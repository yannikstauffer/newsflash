## Context

The newsflash project is a Vite 8 + React 19 + TypeScript SPA. Code quality checks (lint, type-check) run locally via husky pre-commit and pre-push hooks, but these can be bypassed with `--no-verify`. There is no server-side CI pipeline to enforce quality gates before merging. The project uses npm as its package manager and has existing scripts for lint, build, and test.

## Goals / Non-Goals

**Goals:**
- Enforce lint, type-check, unit tests, and production build on every pull request
- Prevent broken code from being merged into main or develop
- Provide fast feedback to developers on PR status

**Non-Goals:**
- Deployment automation (separate concern, tied to production-proxy proposal)
- E2E tests in CI (Playwright requires browser setup; defer to a follow-up)
- Matrix builds across multiple Node versions (single target is sufficient)
- SonarQube integration (sonar-project.properties exists but is out of scope)
- Code coverage reporting or badge generation

## Decisions

### Single workflow file

Use one workflow file (`.github/workflows/ci.yml`) with a single job rather than splitting into multiple workflows or jobs. The full pipeline (lint, type-check, test, build) runs in under 3 minutes for a project this size, so parallelizing into separate jobs would add overhead from repeated checkout/install steps without meaningful time savings.

**Alternative considered:** Separate jobs for lint, test, and build running in parallel. Rejected because the npm install step would need to run in each job, and the total wall-clock time would likely be similar or worse due to job startup overhead.

### Trigger on PR and push to main

The workflow triggers on:
- `pull_request` targeting `main` or `develop`
- `push` to `main` (to catch direct commits or post-merge validation)

**Alternative considered:** Triggering on all branches. Rejected because it wastes CI minutes on feature branches that haven't opened a PR yet.

### Node.js version pinning

Use `actions/setup-node@v4` with a fixed Node version matching the project's runtime (Node 24). Pin the major version to avoid surprises from minor version differences. If an `.nvmrc` or `.node-version` file is added later, the workflow can reference it instead.

### Dependency caching

Use the built-in `cache` option in `actions/setup-node` with `cache: 'npm'`, which caches `~/.npm`. This avoids the need for a separate `actions/cache` step and reduces install time on subsequent runs.

### Step order

1. Checkout code
2. Setup Node.js with npm cache
3. `npm ci` (clean install from lockfile)
4. `npm run lint` (ESLint)
5. `npm run build` (runs `tsc -b && vite build`, covers both type-check and production build)
6. `npm run test` (Vitest)

The build step already includes `tsc -b`, so a separate type-check step is unnecessary. Running lint before build provides faster feedback on style issues. Tests run last since they are the most expensive step.

## Risks / Trade-offs

- **[Risk] Node version drift** — The workflow pins Node 24, but developers may use different local versions. → Mitigation: Add an `.nvmrc` file in a follow-up to keep local and CI versions aligned.
- **[Risk] CI minutes cost** — GitHub Actions free tier has limited minutes for private repos. → Mitigation: Caching and a single-job approach minimize runtime. The project is currently small enough that this is not a concern.
- **[Risk] No E2E tests in CI** — Playwright tests are not included, so UI regressions could slip through. → Mitigation: Acceptable for the first iteration. E2E in CI is a planned follow-up requiring browser installation and potentially a dev server.
- **[Trade-off] Single job vs parallel jobs** — A single sequential job is simpler but means a lint failure blocks test results. This is acceptable because developers should fix lint issues first anyway.
