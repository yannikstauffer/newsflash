## 1. Dependencies

- [x] 1.1 Install `zod` as a dependency (`npm install zod`)

## 2. Route Search Param Validation

- [x] 2.1 Define the feed search param Zod schema in `src/app/router.tsx` with fields: `date` (optional ISO date string), `view` (optional enum `"all"`), `q` (optional string max 200), `hidden` (optional boolean) — all with `.catch(undefined)` fallback
- [x] 2.2 Add `validateSearch` with the Zod schema to the `indexRoute` definition
- [x] 2.3 Export `indexRoute` so `useFeedPage` can use `indexRoute.useSearch()` with full type safety

## 3. Migrate `useFeedPage` State to URL Search Params

- [x] 3.1 Remove the four `useState` calls (`showHidden`, `searchQuery`, `selectedDate`, `allArticles`) and derive them from `getRouteApi("/").useSearch()`
- [x] 3.2 Replace `setSelectedDate` in `handlePreviousDay` / `handleNextDay` with `navigate({ search: ... })` that updates the `date` param (set to `undefined` when result is today)
- [x] 3.3 Replace `setAllArticles` in `handleToggleAllArticles` with `navigate({ search: ... })` that toggles `view` param (`"all"` or `undefined`) and removes `date` when switching back to day view
- [x] 3.4 Replace `setShowHidden` in `handleToggleShowHidden` with `navigate({ search: ... })` that toggles `hidden` param (`true` or `undefined`)
- [x] 3.5 Replace `setSearchQuery` / `onSearchChange` with `navigate({ search: ... })` that sets `q` param (or `undefined` when empty). No debouncing needed — navigate is lightweight and URL updates are batched by the router.

## 4. Unit Tests

- [x] 4.1 Add unit tests for the Zod search param schema: valid inputs, invalid inputs falling back to undefined, edge cases (empty string, malformed date, oversized query)
- [x] 4.2 Update existing `useFeedPage` tests to provide router context (wrap in `RouterProvider` or mock `useSearch`/`useNavigate`) so they work with URL-based state
- [x] 4.3 Add tests verifying that day navigation, toggle all articles, toggle hidden, and search change produce correct search param updates via `navigate`

## 5. E2E Tests

- [x] 5.1 Add Playwright test: navigate to `/?date=<yesterday>` and verify feed shows articles for that date
- [x] 5.2 Add Playwright test: navigate to `/?view=all` and verify all-articles view is active
- [x] 5.3 Add Playwright test: navigate to `/?q=<term>` and verify search is pre-filled and articles are filtered
- [x] 5.4 Add Playwright test: change date via day navigation UI and verify URL updates with `date` param
- [x] 5.5 Add Playwright test: refresh page with search params and verify state is preserved

## 6. Quality Gates

- [x] 6.1 Run `npm run lint` and fix any issues
- [x] 6.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 6.3 Run `npm run test` and fix any issues
- [x] 6.4 Run `npm run test:e2e` and fix any issues
- [x] 6.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 6.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
