## ADDED Requirements

### Requirement: Vite dev proxy routes RSS requests to external feeds
The Vite dev server SHALL proxy requests matching `/api/rss/*` to the corresponding external feed URL.

#### Scenario: Proxy forwards request to feed URL
- **WHEN** the browser requests `/api/rss/engadget`
- **THEN** Vite SHALL proxy the request to `https://www.engadget.com/rss.xml` and return the response

#### Scenario: Proxy returns XML content type
- **WHEN** a proxied RSS request succeeds
- **THEN** the response SHALL preserve the original XML content type

### Requirement: Feed fetch abstraction hides proxy details
A `fetchFeed` function SHALL accept a feed identifier and return the raw XML string. The function SHALL route through the proxy path so the implementation can be swapped without changing calling code.

#### Scenario: fetchFeed returns XML for a valid feed
- **WHEN** `fetchFeed` is called with a valid feed identifier
- **THEN** it SHALL return the raw XML string from the proxied feed

#### Scenario: fetchFeed throws on network failure
- **WHEN** the proxy request fails (network error, timeout, non-2xx status)
- **THEN** `fetchFeed` SHALL throw an error with a descriptive message
