## Why

The feed proxy is dev-only: `vite.config.ts` hardcodes 14 RSS feed URLs as Vite dev server proxies. The app cannot work when deployed because Vite's dev proxy does not exist in production builds. Feed URLs are also hardcoded in each connector's `proxyPath` field, duplicating the mapping between feed IDs and upstream URLs across two locations (`vite.config.ts` and `src/features/connectors/*-connector.ts`).

## What Changes

- Add a **Vercel Edge Function** (`api/rss/[feed].ts`) that acts as a production feed proxy, resolving feed IDs to upstream RSS URLs and forwarding the response
- **Externalize feed URL configuration** into a shared config file (`src/config/feeds.ts`) consumed by both the Vite dev proxy and the Vercel Edge Function, eliminating the duplication between `vite.config.ts` and connector source files
- **Refactor `vite.config.ts`** to import feed URLs from the shared config instead of hardcoding them
- **Update `FeedConfig` type** to remove `proxyPath` in favor of deriving it from the feed ID convention (`/api/rss/<feed-id>`)
- Keep the Vite dev proxy for local development so developers do not need to run Vercel CLI locally for simple work

## Capabilities

### New Capabilities

- `feed-proxy-production`: Vercel Edge Function that proxies RSS feed requests in production, reading feed URLs from the shared feed configuration

### Modified Capabilities

- `feed-proxy`: Refactor to use shared feed configuration instead of hardcoded URLs in `vite.config.ts`. Dev proxy behavior is unchanged but the URL source moves to the shared config file.

## Impact

- **New directory**: `api/` at project root for Vercel serverless/edge functions
- **New file**: `src/config/feeds.ts` — single source of truth for feed ID to URL mapping
- **Modified**: `vite.config.ts` — imports feed URLs from shared config instead of hardcoding them
- **Modified**: `src/features/connectors/types.ts` — `FeedConfig.proxyPath` becomes derived from feed ID
- **Modified**: All 7 connector files — remove hardcoded `proxyPath` values
- **New dependency**: None (Vercel Edge Functions use Web standard `fetch`)
- **Deployment**: Requires Vercel hosting (or compatible edge function platform)
