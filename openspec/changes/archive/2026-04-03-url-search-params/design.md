## Context

The feed page (`/`) manages four pieces of view state via React `useState` in `useFeedPage`: `selectedDate`, `allArticles`, `searchQuery`, and `showHidden`. On page refresh, all state resets to defaults. TanStack Router (v1.168.x) provides first-class search param validation via `validateSearch` with Zod schemas, which maps directly to this use case.

Current state flow:
```
useState → setters → re-render
```

Target state flow:
```
URL search params → validateSearch (Zod) → Route.useSearch() → navigate()
```

## Goals / Non-Goals

**Goals:**
- Feed page view state survives browser refresh
- Clean URLs: defaults are omitted (`/` = today, day view, no search, hidden off)
- Type-safe search params with Zod validation and fallbacks for malformed input
- Minimal change surface: only `router.tsx` and `use-feed-page.ts` are modified

**Non-Goals:**
- Promoting filter preferences (per-connector toggles) to URL — these stay in localStorage
- Adding search params to other routes (`/read-list`, `/settings`)
- Browser history optimization (e.g., replacing vs pushing on every filter change)

## Decisions

### 1. Zod schema with `validateSearch` on the index route

**Choice:** Use `validateSearch` with a plain Zod schema (`.default().catch()` pattern) on the index route.

**Alternatives considered:**
- Plain `validateSearch` function (manual parsing): works but loses type inference and validation
- `zodValidator` from `@tanstack/zod-adapter`: adds a dependency for minimal benefit — plain Zod schemas work directly with `validateSearch` in TanStack Router v1

**Rationale:** TanStack Router v1 accepts Zod schemas directly in `validateSearch`. The `.default().catch()` pattern provides both defaults and graceful fallback for malformed input without an extra adapter package.

### 2. Search param schema shape

```typescript
z.object({
  date:   z.string().date().optional().catch(undefined),
  view:   z.enum(["all"]).optional().catch(undefined),
  q:      z.string().max(200).optional().catch(undefined),
  hidden: z.boolean().optional().catch(undefined),
})
```

- `date`: ISO date string (`"2026-04-03"`). Optional — absent means today.
- `view`: Only `"all"` for now. Optional — absent means day view. Extensible if more view modes emerge.
- `q`: Search query. Max 200 chars (matches existing UI constraint). Optional — absent means no search.
- `hidden`: Boolean. Optional — absent means hidden articles are not shown.

**Why optional with catch?** Omitting defaults from the URL keeps links clean. `.catch(undefined)` ensures malformed params (e.g., `?date=garbage`) silently fall back to the default rather than erroring.

### 3. State derivation in `useFeedPage`

Replace four `useState` calls with derived values from `Route.useSearch()`:

```
const { date, view, q, hidden } = Route.useSearch()

selectedDate  = date ? parseISO(date) : today()
allArticles   = view === "all"
searchQuery   = q ?? ""
showHidden    = hidden ?? false
```

All mutations use `navigate({ search: ... })` instead of `setState`:
- `handlePreviousDay` → `navigate({ search: prev => ({ ...prev, date: prevDay }) })`
- `handleNextDay` → `navigate({ search: prev => ({ ...prev, date: nextDay }) })`
- `handleToggleAllArticles` → `navigate({ search: prev => toggleView(prev) })`
- `handleToggleShowHidden` → `navigate({ search: prev => ({ ...prev, hidden: !prev.hidden || undefined }) })`
- `onSearchChange` → `navigate({ search: prev => ({ ...prev, q: value || undefined }) })`

**Key pattern:** Set param to `undefined` to remove it from the URL (keeps URLs clean).

### 4. Export `indexRoute` for `Route.useSearch()` and `Route.useNavigate()`

The `indexRoute` must be exported from `router.tsx` so that `useFeedPage` can call `indexRoute.useSearch()` and `useNavigate({ from: "/" })` with full type safety.

**Alternative:** Use the generic `useSearch({ from: "/" })` — works but less type-safe and couples to path strings.

### 5. No new dependencies

The `@tanstack/zod-adapter` package is not needed — TanStack Router v1 accepts Zod schemas directly. Zod itself is needed as a new dependency.

## Risks / Trade-offs

**[Risk] Zod bundle size** → Zod adds ~13KB gzipped. This is acceptable for a schema validation library that will likely be reused as search params expand to other routes. Tree-shaking limits the impact.

**[Risk] URL length with search query** → Max 200 chars for `q` is well within URL limits (~2000 chars). No mitigation needed.

**[Risk] Existing `useFeedPage` tests break** → Tests currently render the hook without router context. They'll need wrapping in a `RouterProvider` or mocking `useSearch`/`useNavigate`. This is expected and handled in tasks.

**[Trade-off] `navigate()` vs `setState` performance** → `navigate()` triggers a router transition (URL update + re-render). For rapid typing in the search field, this could be slightly slower than `setState`. Mitigation: the search input's `onChange` can debounce the `navigate` call, or the component can keep a local `useState` for the input value and sync to URL on blur/debounce. This is an implementation detail to evaluate during development.
