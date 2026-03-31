# Feed Proxy

## From: feed-proxy/spec.md

## MODIFIED Requirements

### Requirement: Vite dev proxy routes RSS requests to external feeds
The Vite dev server SHALL proxy requests matching `/api/rss/*` to the corresponding external feed URL. Feed URLs SHALL be read from the shared feed configuration (`src/config/feeds.ts`) instead of being hardcoded in `vite.config.ts`.

#### Scenario: Proxy forwards request to feed URL
- **WHEN** the browser requests `/api/rss/engadget`
- **THEN** Vite SHALL proxy the request to the URL defined for `engadget` in the shared feed configuration and return the response

#### Scenario: Proxy returns XML content type
- **WHEN** a proxied RSS request succeeds
- **THEN** the response SHALL preserve the original XML content type

#### Scenario: Proxy configuration reads from shared feed config
- **WHEN** the Vite dev server starts
- **THEN** it SHALL build proxy routes from the shared `feedUrls` record, not from a hardcoded map in `vite.config.ts`

### Requirement: Feed fetch abstraction hides proxy details
A `fetchFeed` function SHALL accept a feed identifier and return the raw XML string. The function SHALL route through the proxy path so the implementation can be swapped without changing calling code.

#### Scenario: fetchFeed returns XML for a valid feed
- **WHEN** `fetchFeed` is called with a valid feed identifier
- **THEN** it SHALL return the raw XML string from the proxied feed

#### Scenario: fetchFeed throws on network failure
- **WHEN** the proxy request fails (network error, timeout, non-2xx status)
- **THEN** `fetchFeed` SHALL throw an error with a descriptive message

## From: feed-proxy-production/spec.md

## ADDED Requirements

### Requirement: Vercel Edge Function proxies RSS feed requests in production
A Vercel Edge Function at `api/rss/[feed].ts` SHALL accept GET requests with a dynamic feed ID segment, resolve the feed ID to an upstream RSS URL using the shared feed configuration, fetch the upstream feed, and return the response body with the original content type preserved.

#### Scenario: Valid feed ID returns upstream RSS content
- **WHEN** a GET request is made to `/api/rss/engadget`
- **THEN** the edge function SHALL fetch `https://www.engadget.com/rss.xml` and return the XML body with the upstream `Content-Type` header preserved

#### Scenario: Unknown feed ID returns 404
- **WHEN** a GET request is made to `/api/rss/unknown-feed`
- **THEN** the edge function SHALL return HTTP 404 with a JSON error body `{"error": "Unknown feed: unknown-feed"}`

#### Scenario: Upstream feed request fails
- **WHEN** a GET request is made with a valid feed ID but the upstream feed returns a non-2xx status
- **THEN** the edge function SHALL return HTTP 502 with a JSON error body `{"error": "Upstream feed failed"}` and the upstream status code in the message

### Requirement: Shared feed configuration is the single source of truth for feed URLs
A shared configuration file (`src/config/feeds.ts`) SHALL export a `feedUrls` record mapping feed IDs to upstream RSS URLs. Both the Vercel Edge Function and the Vite dev proxy SHALL read feed URLs exclusively from this configuration.

#### Scenario: Feed configuration contains all 14 feed entries
- **WHEN** the `feedUrls` record is imported
- **THEN** it SHALL contain entries for all 14 feeds: digitec, galaxus, srf-latest, srf-switzerland, srf-international, srf-economy, srf-sport, srf-football, srf-culture, srf-technology, winfuture, engadget, heise, ubergizmo

#### Scenario: Adding a new feed requires only a config entry
- **WHEN** a new feed ID and URL are added to the `feedUrls` record
- **THEN** both the Vercel Edge Function and Vite dev proxy SHALL serve the new feed without any other code changes

### Requirement: Feed proxy path is derived from feed ID
A utility function SHALL derive the proxy path from a feed ID using the convention `/api/rss/<feed-id>`. Connectors SHALL use this function instead of storing explicit `proxyPath` values.

#### Scenario: Proxy path derivation
- **WHEN** `feedProxyPath("engadget")` is called
- **THEN** it SHALL return `/api/rss/engadget`

#### Scenario: Connectors use derived proxy paths
- **WHEN** a connector's feed configuration is accessed
- **THEN** the proxy path SHALL be derived from the feed ID, not hardcoded in the connector definition
