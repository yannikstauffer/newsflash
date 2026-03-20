## ADDED Requirements

### Requirement: Connector interface defines a uniform contract for all feed sources
Each Connector SHALL expose an `id` (unique string), `name` (display name), `language` ("de" or "en"), `feeds` (array of feed configurations), and a `parse(xml: string): NormalizedArticle[]` method.

#### Scenario: Connector provides metadata
- **WHEN** a connector is registered
- **THEN** it SHALL have a unique `id`, a human-readable `name`, a `language` of "de" or "en", and at least one feed in `feeds`

#### Scenario: Connector parses XML into normalized articles
- **WHEN** `parse()` is called with valid RSS or Atom XML
- **THEN** it SHALL return an array of `NormalizedArticle` objects with `id`, `title`, `description`, `link`, `publishedAt`, `source`, `language`, and optional `imageUrl` and `category`

### Requirement: NormalizedArticle schema
Each article SHALL have: `id` (hash of `link`), `title` (string), `description` (string), `link` (URL to original article), `publishedAt` (Date), `source` (connector id), `language` ("de" or "en"). Optional fields: `imageUrl` (string), `category` (string).

#### Scenario: Article ID is derived from link
- **WHEN** an article is parsed
- **THEN** its `id` SHALL be a deterministic hash of the `link` field

#### Scenario: Missing optional fields default to undefined
- **WHEN** an RSS item has no thumbnail or category
- **THEN** `imageUrl` and `category` SHALL be `undefined`

### Requirement: Base parser handles standard RSS 2.0 and Atom feeds
A shared base parser SHALL parse both RSS 2.0 (`<item>`) and Atom (`<entry>`) feed structures, mapping standard fields to the NormalizedArticle schema.

#### Scenario: Parse RSS 2.0 feed
- **WHEN** XML contains `<rss>` with `<item>` elements
- **THEN** the base parser SHALL map `<title>`, `<description>`, `<link>`, `<pubDate>` to the corresponding NormalizedArticle fields

#### Scenario: Parse Atom feed
- **WHEN** XML contains `<feed>` with `<entry>` elements
- **THEN** the base parser SHALL map `<title>`, `<summary>` or `<content>`, `<link href="">`, `<updated>` or `<published>` to the corresponding NormalizedArticle fields

#### Scenario: Malformed XML returns empty array
- **WHEN** XML is malformed or contains no items/entries
- **THEN** the base parser SHALL return an empty array without throwing

### Requirement: Seven connectors are provided
The system SHALL include connectors for: digitec, galaxus, srf, winfuture, engadget, heise, ubergizmo.

#### Scenario: All connectors are registered
- **WHEN** the connector registry is loaded
- **THEN** it SHALL contain exactly 7 connectors with ids "digitec", "galaxus", "srf", "winfuture", "engadget", "heise", "ubergizmo"

### Requirement: SRF connector supports multiple sub-feeds
The SRF connector SHALL declare all available SRF feeds (News, Sport, Culture, Knowledge topics) in its `feeds` array, each with a unique sub-ID and display name.

#### Scenario: SRF exposes topic-level feeds
- **WHEN** the SRF connector is loaded
- **THEN** its `feeds` array SHALL contain entries for individual topics (e.g., "Latest", "Switzerland", "International", "Football", "Technology")

### Requirement: Connector registry exports all connectors
A registry module SHALL export all connectors as an array, serving as the single source of truth for available sources.

#### Scenario: Registry is iterable
- **WHEN** the registry is imported
- **THEN** it SHALL provide an array of all Connector instances
