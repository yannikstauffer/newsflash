## Why

The entire app is a single bundle — all 7 connectors, all features, and the config page are loaded upfront even if the user only views the feed. This increases initial load time unnecessarily. Lazy-loading non-critical route components will reduce the initial bundle size and improve time-to-interactive.

## What Changes

- Wrap `ReadListPage` and `FeedConfigPage` in `React.lazy()` so they are loaded on demand
- Add a `Suspense` boundary with a simple loading spinner fallback around lazily-loaded views
- Vite will automatically split the build output into separate chunks for each lazy-loaded component
- Note: this change depends on client-side-routing being implemented first for full route-based splitting. However, it can be partially applied to the current view-switching pattern in `app-layout.tsx`.

## Capabilities

### New Capabilities

_None. This change optimizes loading behavior without introducing new user-facing capabilities._

### Modified Capabilities

_None. No existing spec-level requirements change — this is an implementation-level optimization._

## Impact

- **Code**: `src/app/app-layout.tsx` — static imports of `ReadListPage` and `FeedConfigPage` replaced with `React.lazy()` dynamic imports; `Suspense` boundary added around the view-switching block
- **Build output**: Vite will produce additional chunk files instead of a single bundle
- **Dependencies**: No new dependencies required (`React.lazy` and `Suspense` are built into React 19)
- **Prerequisite**: Full route-based splitting depends on client-side-routing proposal; partial implementation (lazy views in `app-layout.tsx`) can proceed independently
