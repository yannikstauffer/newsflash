## Context

This is a Vite 8 + React 19 + TypeScript SPA that aggregates 14 RSS feeds from 7 sources. Currently, all feed fetching relies on Vite's dev server proxy configured in `vite.config.ts`. The proxy maps `/api/rss/<feed-id>` to upstream feed URLs. In production builds, no proxy exists, so feed fetching fails entirely. Feed URLs are duplicated: once in `vite.config.ts` (as the `feedTargets` map) and implicitly in each connector's `proxyPath` field.

The `fetchFeed` abstraction in `src/features/connectors/fetch-feed.ts` already uses relative paths (`/api/rss/<id>`), so the client code is proxy-agnostic. The gap is purely on the server side: there is no production handler for `/api/rss/*` routes.

## Goals / Non-Goals

**Goals:**
- Make the app functional when deployed to Vercel (or any platform supporting edge functions)
- Eliminate feed URL duplication by creating a single source of truth
- Keep local development simple — `npm run dev` should work without Vercel CLI
- Maintain the existing `/api/rss/<feed-id>` URL convention so no client code changes are needed

**Non-Goals:**
- No response caching at the edge (can be added later via `Cache-Control` headers)
- No feed URL management UI (feed list remains static configuration)
- No support for dynamic feed addition at runtime
- No authentication or rate limiting on the proxy endpoint

## Decisions

### 1. Vercel Edge Functions for Production Proxy

The production proxy will be a single Vercel Edge Function at `api/rss/[feed].ts` using a dynamic route segment. It will look up the feed ID in the shared config, fetch the upstream URL, and forward the response with appropriate headers.

```
Request: GET /api/rss/engadget
→ Edge Function resolves "engadget" → "https://www.engadget.com/rss.xml"
→ Fetches upstream URL
→ Returns XML response with Content-Type preserved
```

**Why Vercel Edge Functions:**
- Zero cold start (runs on V8 isolates, not containers)
- Uses Web standard `fetch` API — no additional dependencies
- Automatic deployment via `git push` with Vercel
- Free tier covers personal use easily
- The project is an SPA ideally suited for Vercel's static + functions model

**Alternative considered:** Cloudflare Workers. Similar capability, but Vercel is a more natural fit since it handles both the static SPA hosting and the API functions in one deployment.

**Alternative considered:** Netlify Functions. Lambda-based with cold starts. Edge functions available but less mature ecosystem.

### 2. Shared Feed Configuration File

A new `src/config/feeds.ts` file will export the feed ID → URL mapping as a plain TypeScript record:

```typescript
export const feedUrls: Record<string, string> = {
  "digitec": "https://static.digitecgalaxus.ch/feeds/rss/digitec_CH_de.xml",
  "engadget": "https://www.engadget.com/rss.xml",
  // ... all 14 feeds
}
```

Both `vite.config.ts` and the Vercel Edge Function import from this file. Connectors derive their proxy path from the feed ID convention (`/api/rss/${feedId}`) rather than storing a hardcoded `proxyPath`.

**Why a TypeScript file (not JSON or YAML):** TypeScript provides type safety and can be imported directly by both Vite config (which runs in Node) and the edge function. No parsing step needed.

### 3. Keep Vite Dev Proxy for Local Development

The Vite dev proxy remains the primary development mechanism. It will be refactored to read from `src/config/feeds.ts` instead of the hardcoded `feedTargets` map.

**Why keep it:** Developers can run `npm run dev` without installing or configuring Vercel CLI. The Vite proxy is fast, requires zero setup, and logs are visible in the terminal. For iterating on UI changes, this is the simplest workflow.

**When to use Vercel dev:** Only needed when testing the edge function itself. Not required for day-to-day feature development.

### 4. Simple Passthrough Proxy — No Caching Initially

The edge function will be a simple passthrough: fetch upstream, return response. No caching headers, no response transformation, no error retry.

**Why:** Simplest possible implementation that solves the production problem. Caching can be added later by setting `Cache-Control` headers on the edge function response. Feed data is already fetched on-demand by the client, so the latency of a passthrough is acceptable.

### 5. Proxy Path Convention Replaces Explicit proxyPath

The `FeedConfig` interface will drop the `proxyPath` field. Instead, a utility function derives the path:

```typescript
function feedProxyPath(feedId: string): string {
  return `/api/rss/${feedId}`
}
```

This eliminates the coupling between connector definitions and the proxy URL structure.

## Risks / Trade-offs

- **[Upstream feed downtime]** → The proxy is a passthrough, so upstream failures propagate directly. Acceptable for MVP; retry/fallback can be added to the edge function later.
- **[Vercel platform lock-in]** → The edge function uses Web standard APIs (`fetch`, `Request`, `Response`), so porting to Cloudflare Workers or Netlify Edge would be minimal effort. The shared config file is platform-agnostic.
- **[CORS on edge function]** → The edge function serves from the same origin as the SPA (both on the Vercel deployment URL), so no CORS headers are needed. If the function were hosted separately, CORS headers would need to be added.
- **[Feed URL changes]** → Changing a feed URL requires a code change and redeploy. Acceptable for a static list of 14 feeds. A database-backed config would be overengineering for this use case.
- **[Rate limiting by upstream feeds]** → Some feeds may rate-limit the Vercel edge IP range. No mitigation planned for MVP. Caching would reduce request frequency if this becomes an issue.
