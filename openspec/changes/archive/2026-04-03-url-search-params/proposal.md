## Why

Refreshing the feed page resets all view state (selected date, search query, view mode, show-hidden toggle) to defaults because this state lives in React `useState`. Promoting it to URL search params makes the view bookmarkable, shareable, and refresh-resilient.

## What Changes

- The feed route (`/`) gains validated URL search params: `date`, `view`, `q`, `hidden`
- `useFeedPage` reads state from URL search params instead of `useState` and mutates via `navigate()`
- Default values are omitted from the URL for clean links (e.g. `/` = today, day view, no search, hidden off)
- When `view=all` is active, `date` is irrelevant; toggling back resets to today

## Capabilities

### New Capabilities

- `feed-search-params`: URL search param schema, validation, defaults, and param interaction rules for the feed route

### Modified Capabilities

- `navigation/routing`: Feed route gains `validateSearch` with search param validation
- `feed/filtering`: Filter state (date, search, hidden, view mode) is read from URL params instead of component state

## Impact

- `src/app/router.tsx` — add Zod search param validation to index route
- `src/features/feed/hooks/use-feed-page.ts` — replace 4x `useState` with `Route.useSearch()` + `useNavigate()`
- New dependency: `@tanstack/zod-adapter` (for `zodValidator`/`fallback`)
- No changes to `filter-bar.tsx` or `feed-page.tsx` (props-driven, unaffected)
- Existing tests for `useFeedPage` will need updating to work with router context
