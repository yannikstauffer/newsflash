## 1. Create workflow directory

- [ ] 1.1 Create `.github/workflows/` directory

## 2. Create CI workflow

- [ ] 2.1 Create `.github/workflows/ci.yml` with workflow name and trigger configuration (pull_request to main/develop, push to main)
- [ ] 2.2 Add job definition with `ubuntu-latest` runner
- [ ] 2.3 Add checkout step using `actions/checkout@v4`
- [ ] 2.4 Add Node.js setup step using `actions/setup-node@v4` with Node 24 and npm caching enabled
- [ ] 2.5 Add `npm ci` step for clean dependency installation
- [ ] 2.6 Add `npm run lint` step
- [ ] 2.7 Add `npm run build` step (covers tsc type-check and Vite production build)
- [ ] 2.8 Add `npm run test` step

## 3. Verification

- [ ] 3.1 Validate the workflow YAML syntax (e.g., `actionlint` or push to a test branch)
- [ ] 3.2 Verify the workflow runs successfully on a test pull request
