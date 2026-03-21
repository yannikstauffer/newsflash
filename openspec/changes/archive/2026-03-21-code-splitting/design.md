## Context

The newsflash app currently bundles all features into a single JavaScript file. The view-switching logic in `src/app/app-layout.tsx` uses a `useState<View>` pattern with conditional rendering to show `FeedPage`, `ReadListPage`, or `FeedConfigPage`. All three components and their dependency trees are statically imported and included in the initial bundle regardless of which view the user navigates to.

Most users land on the feed view and may never visit the settings page. Loading all views upfront wastes bandwidth and delays time-to-interactive.

## Goals / Non-Goals

**Goals:**

- Reduce initial bundle size by deferring the load of `ReadListPage` and `FeedConfigPage`
- Provide a non-jarring loading experience when a lazily-loaded view is first accessed
- Ensure Vite produces separate chunks for each lazy-loaded view automatically

**Non-Goals:**

- Route-based code splitting with a client-side router (separate proposal; this change works with the current `useState` view switching)
- Lazy-loading individual connectors or sub-features within a page
- Preloading or prefetching lazy chunks on hover/idle (future optimization)
- Server-side rendering or streaming HTML

## Decisions

### 1. Use `React.lazy` + dynamic `import()` for view-level splitting

**Choice**: Replace static imports of `ReadListPage` and `FeedConfigPage` with `React.lazy(() => import(...))` calls in `app-layout.tsx`.

**Rationale**: This is React's built-in mechanism for component-level code splitting. It requires no additional dependencies and Vite natively supports dynamic `import()` for chunk generation. `FeedPage` remains statically imported because it is the default view and will always be needed on initial load.

**Alternatives considered**:
- **Manual dynamic import with state management**: More control but reimplements what `React.lazy` already provides. Unnecessary complexity.
- **Third-party libraries (loadable-components)**: Useful for SSR scenarios, but this is a client-only SPA. No benefit over `React.lazy`.

### 2. Single `Suspense` boundary wrapping the view container

**Choice**: Wrap the `<main>` content area with a single `<Suspense>` boundary using a centered spinner as fallback.

**Rationale**: A single boundary keeps the layout stable (header stays visible) while the lazy view loads. Per-view boundaries would add complexity without benefit since only one view renders at a time.

### 3. Keep `FeedPage` eagerly loaded

**Choice**: `FeedPage` remains a static import — it is not lazy-loaded.

**Rationale**: The feed is the landing view for every session. Lazy-loading it would add a loading flash on every app start with zero bundle savings for the critical path.

## Risks / Trade-offs

- **Brief loading flash on first navigation** → The spinner fallback displays while the chunk loads. On fast connections this is barely noticeable. Mitigation: keep the fallback lightweight (CSS spinner, no extra assets).
- **Chunk load failure on flaky networks** → `React.lazy` will throw if the chunk fails to load. Mitigation: the app's existing error boundary should catch this and allow retry. If no error boundary exists, one should be added around the `Suspense` boundary.
- **Depends on client-side-routing for full benefit** → Without a router, view state resets on page refresh (user always starts on feed). This limits the scenarios where lazy chunks load. Mitigation: this is acceptable since the primary goal is reducing initial bundle size, not optimizing navigations.
- **Cache invalidation on deploys** → Chunk filenames include content hashes by default in Vite, so stale cached HTML pointing to old chunk names can cause load failures. Mitigation: standard Vite behavior handles this; long-term a service worker can help.
