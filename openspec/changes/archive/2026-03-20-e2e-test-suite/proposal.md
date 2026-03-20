## Why

The app has zero meaningful E2E coverage — the only test (`app.spec.ts`) checks a counter button that no longer exists. Unit tests cover logic well, but critical integration paths (thumbnail extraction through to rendered card, feed filtering, article actions, navigation) are unvalidated. Adding a Playwright E2E suite with network-level mocking ensures these flows work end-to-end without depending on live RSS feeds.

## What Changes

- **Delete** stale `tests-e2e/app.spec.ts`
- **Add mobile viewport** project (Pixel 7) to Playwright config alongside Desktop Chrome
- **Add RSS fixture files** (7 connector XMLs + empty feed) with deterministic article data exercising all image extraction paths
- **Add 1x1 red PNG placeholder** for real-pixel image loading assertions (`naturalWidth > 0`)
- **Add 6 test specs**: navigation, feed browsing, filtering, article actions (including mobile swipe), settings, and per-connector card validation
- **Network mocking** via `page.route()` for all `/api/rss/**` requests and image URLs
- **localStorage** seeded/cleared between tests for deterministic state

## Capabilities

### New Capabilities
- `e2e-testing`: Playwright E2E test infrastructure — fixtures, mocking helpers, mobile viewport config, and test specs covering all user-facing flows

### Modified Capabilities

None — this change adds test coverage without changing any application behavior or requirements.

## Impact

- **Test infrastructure**: `playwright.config.ts`, `tests-e2e/` directory
- **CI**: E2E tests will run via `npm run test:e2e` (existing script)
- **Dependencies**: No new dependencies (Playwright already installed)
- **Application code**: No changes
