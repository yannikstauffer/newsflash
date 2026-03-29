## 1. Investigate SRF URL patterns

- [x] 1.1 Verify Wissen-category article URLs by checking actual article links in the feed — determine if they use `/wissen/` or other paths (e.g., `/gesundheit/`, `/natur/`)
- [x] 1.2 Document the final URL match patterns for each category filter based on findings

## 2. Add SRF category filters

- [x] 2.1 Add `filters` array to `srfConnector` in `src/features/connectors/sources/srf-connector.ts` with three `ArticleFilter` entries: `srf-filter-sport` (matches `/sport/`), `srf-filter-kultur` (matches `/kultur/`), `srf-filter-wissen` (match pattern from task 1.2)
- [x] 2.2 Each filter uses `enabledByDefault: true` and German labels: "Sport", "Kultur", "Wissen"

## 3. Unit tests

- [x] 3.1 Add SRF filter match tests to `src/features/connectors/sources/connector-filters.test.ts` — test each filter matches expected URL patterns and does not match other categories
- [x] 3.2 Add a test to `src/features/feed/utils/filter-articles.test.ts` verifying that disabling an SRF category filter excludes matching articles regardless of source feed

## 4. E2E test

- [x] 4.1 Create or extend an E2E test that disables an SRF category filter in settings and verifies sport articles from `srf-latest` are hidden from the feed

## 5. Quality Gates

- [x] 5.1 Run `npm run lint` and fix any issues
- [x] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 5.3 Run `npm run test` and fix any issues
- [x] 5.4 Run `npm run test:e2e` and fix any issues
- [x] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
