## Context

The app fetches RSS/Atom feeds via `fetch("/api/rss/<feed-id>")`, parses XML with `fast-xml-parser`, extracts images through a multi-strategy pipeline (media tags → inline `<img>` extraction → no image), and renders article cards. All user state (hidden articles, read list, feed preferences, theme) lives in localStorage. There are 7 connectors with 14 total feed endpoints. The existing Playwright config targets Desktop Chrome with a Vite dev server.

## Goals / Non-Goals

**Goals:**
- Deterministic, offline E2E tests via network-level RSS mocking
- Coverage of all user-facing flows: navigation, feed browsing, filtering, article actions, settings
- Per-connector validation that parsed articles render complete cards with working thumbnails
- Mobile viewport testing including touch swipe gestures
- Real-pixel image assertions (not just DOM presence)

**Non-Goals:**
- Visual regression testing (screenshot comparison)
- Performance/load testing
- Testing the Vite proxy or real RSS endpoint availability
- Accessibility audit automation (covered by eslint-plugin-jsx-a11y at build time)

## Decisions

### 1. Network mocking via `page.route()` (not MSW or fixture server)

Playwright's built-in `page.route()` intercepts at the browser level and returns fixture data directly. No extra dependencies, no server to manage, works identically in CI.

**Alternative considered**: MSW (Mock Service Worker) — adds a dependency, requires service worker registration, and the interception layer is less transparent in Playwright traces.

### 2. One XML fixture per connector (shared across SRF's 8 feeds)

SRF has 8 feed endpoints but they all use the same parser. A single `srf.xml` fixture served for all `/api/rss/srf-*` paths keeps fixtures manageable while still validating the parse pipeline.

**Alternative considered**: Per-feed fixtures — 14 files instead of 7, with no additional coverage since the parser is identical.

### 3. Real-pixel image placeholder (1x1 red PNG)

Mock `**/*.jpg` requests to serve a tiny PNG. Assert `naturalWidth > 0` on rendered `<img>` elements to prove the image actually loaded through the browser's image pipeline, not just that the DOM element exists.

**Alternative considered**: Assert `src` attribute only — doesn't catch broken image rendering, CSS visibility issues, or `loading="lazy"` problems.

### 4. Selectors follow Playwright best practice (role/label first)

Use `getByRole`, `getByLabel`, `getByText`, and semantic `locator("article")`. No `data-testid` attributes needed — the existing aria coverage is sufficient and this approach doubles as accessibility validation.

**Alternative considered**: Adding `data-testid` — stable but doesn't validate accessibility, adds noise to production DOM.

### 5. Swipe gesture testing via Playwright pointer events

Use `page.touchscreen` or `pointer` action sequences to simulate swipe left/right on mobile viewport. Run these only in the mobile-chrome project.

**Alternative considered**: Skip swipe tests — but swipe is a primary interaction path on mobile, too important to leave uncovered.

### 6. localStorage clearing between tests

Use `page.evaluate(() => localStorage.clear())` in `beforeEach` to ensure deterministic state. Seed specific localStorage values when tests need pre-existing state (e.g., saved articles in read list).

## Risks / Trade-offs

- **Fixture drift**: Fixtures are static XML; if connector parsing logic changes, fixtures may not reflect real-world feed structure → Mitigated by connector-specific fixtures that exercise each image extraction path
- **Swipe flakiness**: Touch gesture simulation can be timing-sensitive → Mitigated by generous timeouts and retry (Playwright config already has `retries: 1`)
- **Date-dependent tests**: Filter-by-day logic depends on "today" → Mitigated by using "All articles" toggle in most tests, and `page.clock` for day-navigation tests
