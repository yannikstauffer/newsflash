## 1. Infrastructure

- [x] 1.1 Update `playwright.config.ts` to add `mobile-chrome` project (Pixel 7 device) alongside existing Desktop Chrome
- [x] 1.2 Delete stale `tests-e2e/app.spec.ts`
- [x] 1.3 Create `tests-e2e/fixtures/placeholder.png` (1x1 red pixel PNG)
- [x] 1.4 Create `tests-e2e/fixtures/empty.xml` (valid RSS with no items)

## 2. Connector Fixtures

- [x] 2.1 Create `tests-e2e/fixtures/digitec.xml` (2 articles: inline `<img>`, `<a><img>` wrapper)
- [x] 2.2 Create `tests-e2e/fixtures/galaxus.xml` (2 articles: `<p><img></p>`, `media:thumbnail`)
- [x] 2.3 Create `tests-e2e/fixtures/srf.xml` (2 articles: `media:thumbnail`, `media:content[]`)
- [x] 2.4 Create `tests-e2e/fixtures/winfuture.xml` (2 articles: `enclosure type="image/*"`, inline `<img>` fallback)
- [x] 2.5 Create `tests-e2e/fixtures/engadget.xml` (2 articles: single `media:content`, array `media:content`)
- [x] 2.6 Create `tests-e2e/fixtures/heise.xml` (Atom format, 2 articles: image in `<content>` via `<a><img>` with plain summary, image in `<summary>`)
- [x] 2.7 Create `tests-e2e/fixtures/ubergizmo.xml` (2 articles: 1 with inline `<img>`, 1 without image)

## 3. Test Helpers

- [x] 3.1 Create shared test helper for RSS mocking (`page.route` for `/api/rss/**`) and image mocking (`**/*.jpg` → placeholder PNG)
- [x] 3.2 Create shared helper for localStorage clearing/seeding between tests
- [x] 3.3 Create shared helper for connector-specific feed setup (enable only one connector, mock its feeds, return empty for others)

## 4. Navigation Tests

- [x] 4.1 Create `tests-e2e/navigation.spec.ts`: app loads on feed page, tab switching between Feed/Read List/Settings, active tab indicator (`aria-current`), page content switches correctly

## 5. Feed Browsing Tests

- [x] 5.1 Create `tests-e2e/feed.spec.ts`: articles visible with all card fields (title as link, source, `<time>` with dateTime, description), image cards have loaded thumbnail (`naturalWidth > 0`), no-image cards have no `<img>`

## 6. Filter Tests

- [x] 6.1 Create `tests-e2e/filter.spec.ts`: search narrows results, search no-match shows empty, clear search restores articles, "All articles" toggle, day navigation prev/next, next-day disabled on today, "Show Hidden" toggle reveals dimmed hidden articles

## 7. Article Action Tests

- [x] 7.1 Create `tests-e2e/article-actions.spec.ts` (desktop): hide via button, save via button, hide via H key (hover + keypress), save via S key (hover + keypress), unhide from hidden view, read list shows saved articles, remove from read list, empty read list message
- [x] 7.2 Add mobile-only tests in `article-actions.spec.ts`: swipe right to hide, swipe left to save (touch pointer events, scoped to `mobile-chrome` project)

## 8. Settings Tests

- [x] 8.1 Create `tests-e2e/settings.spec.ts`: language filter (All/DE/EN) filters articles by language, theme toggle adds/removes `dark` class on `<html>`, disable source removes its articles, re-enable source restores articles after refresh

## 9. Connector Validation Tests

- [x] 9.1 Create `tests-e2e/connectors.spec.ts`: parameterized test for each of 7 connectors — enable only that source, mock its feeds, click "All articles", verify cards have title (linked), source label, timestamp, description, and loaded thumbnails where expected (Ubergizmo also validates no-image card)
