## 1. Setup

- [x] 1.1 Install `@tanstack/react-router` package
- [x] 1.2 Create route definitions file at `src/app/router.tsx` with root route, index route (`/`), read-list route (`/read-list`), and settings route (`/settings`)

## 2. Route Components

- [x] 2.1 Create lazy route module for `ReadListPage` at `/read-list`
- [x] 2.2 Create lazy route module for `FeedConfigPage` at `/settings`
- [x] 2.3 Add not-found route that redirects to `/`

## 3. App Integration

- [x] 3.1 Refactor `src/app/app-layout.tsx` into a layout route component — remove `useState<View>`, replace conditional rendering with `<Outlet />`, convert nav buttons to TanStack Router `<Link>` components with active state styling and `aria-current="page"`
- [x] 3.2 Update `src/App.tsx` to render `RouterProvider` with the configured router instead of `AppLayout` directly

## 4. Testing

- [x] 4.1 Write unit tests for route configuration — verify all three routes resolve to correct components
- [x] 4.2 Write tests for navigation link active state and `aria-current` attribute
- [x] 4.3 Write tests for not-found route redirect behavior
- [x] 4.4 Verify lazy loading works — `ReadListPage` and `FeedConfigPage` are in separate chunks (check Vite build output)

## 5. Cleanup

- [x] 5.1 Remove `View` type and `useState<View>` from `app-layout.tsx`
- [x] 5.2 Run `npm run lint` and `npm run build` to verify no regressions
