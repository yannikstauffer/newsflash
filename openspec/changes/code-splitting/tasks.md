## 1. Lazy-load non-critical views

- [ ] 1.1 Replace static imports of `ReadListPage` and `FeedConfigPage` in `src/app/app-layout.tsx` with `React.lazy(() => import(...))` calls
- [ ] 1.2 Ensure both `ReadListPage` and `FeedConfigPage` use default exports (or wrap named exports) so `React.lazy` can resolve them

## 2. Add Suspense boundary with loading fallback

- [ ] 2.1 Create a simple centered loading spinner component (CSS-only, no extra dependencies)
- [ ] 2.2 Wrap the view-switching block in `app-layout.tsx` with a `<Suspense>` boundary using the spinner as fallback

## 3. Verification

- [ ] 3.1 Run `npm run build` and confirm Vite outputs separate chunks for `ReadListPage` and `FeedConfigPage`
- [ ] 3.2 Verify `FeedPage` renders immediately on app start without a loading spinner
- [ ] 3.3 Verify navigating to "Read List" and "Settings" shows the spinner briefly then renders the view
- [ ] 3.4 Run `npm run lint` and `npm run test` to confirm no regressions
