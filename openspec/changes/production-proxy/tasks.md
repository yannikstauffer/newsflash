## 1. Shared Feed Configuration

- [x] 1.1 Create `src/config/feeds.ts` exporting `feedUrls` record with all 14 feed ID → URL mappings
- [x] 1.2 Create `feedProxyPath(feedId: string)` utility function in `src/config/feeds.ts`
- [x] 1.3 Write unit tests for `feedProxyPath` and validate `feedUrls` contains all 14 entries

## 2. Refactor Vite Dev Proxy

- [x] 2.1 Refactor `vite.config.ts` to import `feedUrls` from `src/config/feeds.ts` and remove hardcoded `feedTargets` map
- [x] 2.2 Verify dev server proxies still work with `npm run dev`

## 3. Refactor Connectors

- [x] 3.1 Remove `proxyPath` field from `FeedConfig` interface in `src/features/connectors/types.ts`
- [x] 3.2 Update all 7 connector files to remove hardcoded `proxyPath` values from feed definitions
- [x] 3.3 Update `fetchFeed` and any calling code to derive proxy paths using `feedProxyPath()`
- [x] 3.4 Update existing connector tests to reflect the removed `proxyPath` field

## 4. Vercel Edge Function

- [x] 4.1 Create `api/rss/[feed].ts` edge function that resolves feed ID from URL, looks up upstream URL in `feedUrls`, fetches upstream, and returns response
- [x] 4.2 Handle error cases: unknown feed ID returns 404, upstream failure returns 502
- [x] 4.3 Add `vercel.json` configuration if needed for edge function routing
- [x] 4.4 Write unit tests for the edge function handler logic

## 5. Integration Verification

- [x] 5.1 Run `npm run build` and verify no TypeScript errors
- [x] 5.2 Run `npm run lint` and verify no lint errors
- [x] 5.3 Run full test suite and verify all tests pass
- [x] 5.4 Test locally with `npm run dev` to confirm feeds load correctly through refactored proxy
