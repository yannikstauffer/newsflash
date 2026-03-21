## Context

The application is a Vite 8 + React 19 + TypeScript SPA. Navigation is currently handled by a `useState<View>` pattern in `src/app/app-layout.tsx`, which conditionally renders one of three page components: `FeedPage`, `ReadListPage`, and `FeedConfigPage`. There is no URL-based routing — the browser address bar always shows `/` regardless of which view is active.

The app entry point (`src/main.tsx`) renders `App` inside `StrictMode`, and `App` simply renders `AppLayout`. No router provider exists.

## Goals / Non-Goals

**Goals:**

- Enable URL-based navigation with browser history support (back/forward)
- Support deep linking and bookmarkable URLs for all three views
- Lazy load non-critical route components to preserve initial load performance
- Maintain the existing nav bar layout and styling
- Type-safe route definitions

**Non-Goals:**

- Nested routing or route parameters (not needed for current views)
- Server-side rendering or static site generation
- Route-level data loading (pages manage their own data fetching)
- Authentication guards or protected routes
- URL search params or query string management
- File-based routing convention (explicit route definitions preferred for this small app)

## Decisions

### Decision 1: TanStack Router over React Router

**Choice:** TanStack Router (`@tanstack/react-router`)

**Alternatives considered:**
- **React Router v7**: More established, larger community. However, it has shifted toward framework-level concerns (Remix merger), its API surface is larger than what this app needs, and type safety requires additional configuration.
- **Wouter**: Minimal and lightweight. However, it lacks built-in type-safe route definitions and has a smaller ecosystem.

**Rationale:** TanStack Router provides first-class TypeScript type safety for route params and search params, has a smaller bundle size than React Router, integrates cleanly with React 19, and its code-based route definition approach fits the project's explicit style. The three-route structure means file-based routing adds no value.

### Decision 2: Code-based route definitions

**Choice:** Define routes programmatically in a single route definitions file rather than using file-based routing.

**Rationale:** With only three routes, file-based routing adds tooling overhead (TanStack Router plugin, generated route tree) without meaningful benefit. A single file with explicit `createRoute` calls is easier to understand and maintain.

### Decision 3: Route structure

**Choice:** Three flat routes with no nesting.

| Path | Component | Loading |
|------|-----------|---------|
| `/` | `FeedPage` | Eager |
| `/read-list` | `ReadListPage` | Lazy |
| `/settings` | `FeedConfigPage` | Lazy |

**Rationale:** The feed is the primary view and should load immediately. Read list and settings are secondary views — lazy loading them reduces the initial bundle. No route needs params or nested outlets.

### Decision 4: Router integration point

**Choice:** Create the router in `src/app/router.tsx`, provide it via `RouterProvider` in `App.tsx`. Refactor `AppLayout` into a layout route that renders the nav bar and an `<Outlet />`.

**Rationale:** This keeps the router configuration in the `app/` layer (per Bulletproof React architecture), separates route definitions from the layout shell, and requires minimal changes to `main.tsx`.

### Decision 5: Navigation links

**Choice:** Replace `<button onClick>` nav items with TanStack Router `<Link>` components, using the router's active state for styling.

**Rationale:** Router-aware links automatically handle URL updates, browser history, and provide accessible `<a>` elements with proper `href` attributes. The active link state replaces the manual `activeView === id` check.

## Risks / Trade-offs

- **New dependency**: Adding `@tanstack/react-router` increases bundle size by ~12-15 KB gzipped. Mitigation: This is offset by lazy loading two of three route components, and the UX improvement justifies the cost.
- **TanStack Router maturity**: Less battle-tested than React Router. Mitigation: The API surface used (flat routes, links, lazy loading) is stable and well-documented. No advanced features are needed.
- **Catch-all route behavior**: Users may navigate to undefined paths. Mitigation: Add a not-found route that redirects to `/`.
