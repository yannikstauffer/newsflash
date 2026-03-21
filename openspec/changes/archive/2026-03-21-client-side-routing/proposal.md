## Why

The app currently uses `useState<View>` in `app-layout.tsx` for navigation, which means there is no URL-based routing, no deep linking, and no browser back/forward support. For a content-focused application, this is a significant UX gap — users cannot bookmark views, share links to specific pages, or use standard browser navigation.

## What Changes

- Add TanStack Router as the client-side routing library
- Define three routes: `/` (feed), `/read-list` (read list), `/settings` (settings)
- Replace `useState<View>` navigation in `app-layout.tsx` with router-based navigation
- Enable browser back/forward navigation between views
- Enable deep linking and bookmarkable URLs for all views
- Lazy load `ReadListPage` and `FeedConfigPage` route components (feed loads eagerly as the default route)

## Capabilities

### New Capabilities

- `client-side-routing`: URL-based navigation with TanStack Router, including route definitions, lazy-loaded route components, and navigation links that sync with browser history

### Modified Capabilities

## Impact

- **`src/app/app-layout.tsx`**: Major refactor — remove `useState<View>` navigation, replace conditional rendering with router outlet, convert nav buttons to router links
- **New route definitions file**: Route tree configuration for TanStack Router
- **New lazy-loaded route components**: Wrapper modules for `ReadListPage` and `FeedConfigPage`
- **Dependencies**: Add `@tanstack/react-router` package
- **`src/main.tsx`**: Wrap app with router provider
- **Existing feature components**: No changes needed — `FeedPage`, `ReadListPage`, and `FeedConfigPage` remain as-is
