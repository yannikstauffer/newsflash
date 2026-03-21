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
