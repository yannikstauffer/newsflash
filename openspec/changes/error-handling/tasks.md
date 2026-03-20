## 1. Error Boundary Component

- [ ] 1.1 Create `src/components/error-boundary.tsx` as a React class component with `componentDidCatch` logging and `getDerivedStateFromError` state handling
- [ ] 1.2 Implement fallback UI with "Something went wrong" message and a "Reload" button that calls `window.location.reload()`
- [ ] 1.3 Style the fallback UI with Tailwind classes, centered layout, consistent with app design

## 2. AppLayout Integration

- [ ] 2.1 Import the error boundary component in `src/app/app-layout.tsx`
- [ ] 2.2 Wrap the `<main>` content children with the error boundary, keeping the header and nav outside the boundary

## 3. Parse Error Logging

- [ ] 3.1 Add `console.error` call in the `catch` block of `parseRss` in `src/features/connectors/base-parser.ts`, including the source name and error object

## 4. Testing

- [ ] 4.1 Write unit tests for the error boundary component verifying it catches errors and renders fallback UI
- [ ] 4.2 Write unit test for `parseRss` verifying that malformed XML logs to `console.error` and still returns an empty array
- [ ] 4.3 Run `npm run lint` and `npm run test` to verify all checks pass
