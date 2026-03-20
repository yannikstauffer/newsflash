## 1. Lazy List Hook

- [x] 1.1 Create `useLazyList<T>(items: T[], batchSize: number)` hook in `src/hooks/`
- [x] 1.2 Implement IntersectionObserver logic: observe sentinel, expand visible count on intersection
- [x] 1.3 Reset visible count to one batch when `items` reference changes
- [x] 1.4 Disconnect observer when all items are visible
- [x] 1.5 Write tests for `useLazyList` covering initial batch, scroll expansion, reset on items change, and all-loaded state

## 2. Integrate into Feed List

- [x] 2.1 Use `useLazyList` in `feed-list.tsx` to slice articles before rendering
- [x] 2.2 Add sentinel `<div ref={sentinelRef} />` after the last rendered card

## 3. Integrate into Read List

- [x] 3.1 Use `useLazyList` in `read-list-page.tsx` to slice articles before rendering
- [x] 3.2 Add sentinel `<div ref={sentinelRef} />` after the last rendered card

## 4. Verification

- [x] 4.1 Run `npm run lint` and fix any issues
- [x] 4.2 Run `npm run test` and verify all tests pass
- [x] 4.3 Run JetBrains diagnostics on changed files
