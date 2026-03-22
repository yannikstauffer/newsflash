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
A shared base parser SHALL parse both RSS 2.0 (`<item>`) and Atom (`<entry>`) feed structures, mapping standard fields to the NormalizedArticle schema. The image extraction SHALL handle `media:content` as both a single object and an array of objects.

#### Scenario: Parse RSS 2.0 feed
- **WHEN** XML contains `<rss>` with `<item>` elements
- **THEN** the base parser SHALL map `<title>`, `<description>`, `<link>`, `<pubDate>` to the corresponding NormalizedArticle fields

#### Scenario: Parse Atom feed
- **WHEN** XML contains `<feed>` with `<entry>` elements
- **THEN** the base parser SHALL map `<title>`, `<summary>` or `<content>`, `<link href="">`, `<updated>` or `<published>` to the corresponding NormalizedArticle fields

#### Scenario: Malformed XML returns empty array
- **WHEN** XML is malformed or contains no items/entries
- **THEN** the base parser SHALL return an empty array without throwing

#### Scenario: Single media:content element
- **WHEN** an RSS item has one `<media:content>` element with a `url` attribute
- **THEN** `extractImageUrl` SHALL return that URL

#### Scenario: Multiple media:content elements
- **WHEN** an RSS item has multiple `<media:content>` elements (parsed as an array)
- **THEN** `extractImageUrl` SHALL return the `url` from the first element that has a valid `@_url` attribute

#### Scenario: media:content array with no valid URLs
- **WHEN** an RSS item has multiple `<media:content>` elements but none have a `@_url` attribute
- **THEN** `extractImageUrl` SHALL fall through to the next extraction method (enclosure, then inline image)

### Requirement: Seven connectors are provided
The system SHALL include connectors for: digitec, galaxus, srf, winfuture, engadget, heise, ubergizmo.

#### Scenario: All connectors are registered
- **WHEN** the connector registry is loaded
- **THEN** it SHALL contain exactly 7 connectors with ids "digitec", "galaxus", "srf", "winfuture", "engadget", "heise", "ubergizmo"

### Requirement: SRF connector supports multiple sub-feeds
The SRF connector SHALL declare all 26 available SRF feeds in its `feeds` array, organized into 4 groups: News (5 feeds), Sport (8 feeds), Kultur (7 feeds), and Wissen (6 feeds). Each feed SHALL have a unique sub-ID, display name, and group assignment.

#### Scenario: SRF exposes all topic-level feeds
- **WHEN** the SRF connector is loaded
- **THEN** its `feeds` array SHALL contain 26 entries covering News, Sport, Kultur, and Wissen categories

#### Scenario: SRF feeds have group assignments
- **WHEN** the SRF connector is loaded
- **THEN** every feed in its `feeds` array SHALL have a `group` property set to one of "News", "Sport", "Kultur", or "Wissen"

#### Scenario: SRF News group
- **WHEN** the SRF connector feeds are filtered by group "News"
- **THEN** the result SHALL include feeds for: Das Neueste, Schweiz, International, Wirtschaft, News

#### Scenario: SRF Sport group
- **WHEN** the SRF connector feeds are filtered by group "Sport"
- **THEN** the result SHALL include feeds for: Sport, Fussball, Eishockey, Tennis, Ski Alpin, Leichtathletik, Motorsport, Mehr Sport

#### Scenario: SRF Kultur group
- **WHEN** the SRF connector feeds are filtered by group "Kultur"
- **THEN** the result SHALL include feeds for: Kultur, Film & Serien, Gesellschaft & Religion, Literatur, Musik, Kunst, Buehne

#### Scenario: SRF Wissen group
- **WHEN** the SRF connector feeds are filtered by group "Wissen"
- **THEN** the result SHALL include feeds for: Wissen, Gesundheit, Nachhaltigkeit, Mensch, Natur & Tiere, Technik

### Requirement: Connector registry exports all connectors
A registry module SHALL export all connectors as an array, serving as the single source of truth for available sources.

#### Scenario: Registry is iterable
- **WHEN** the registry is imported
- **THEN** it SHALL provide an array of all Connector instances

### Requirement: Feed URLs include all 26 SRF feeds
The feed URL registry SHALL include URL mappings for all 26 SRF feed IDs, using the RSS feed URLs from srf.ch.

#### Scenario: All SRF feed IDs have URLs
- **WHEN** the feed URL registry is loaded
- **THEN** it SHALL contain valid HTTPS URLs for all 26 SRF feed IDs

#### Scenario: New SRF feed URLs are correct
- **WHEN** a new SRF feed URL is looked up (e.g., "srf-ice-hockey")
- **THEN** it SHALL return the corresponding srf.ch RSS feed URL (e.g., `https://www.srf.ch/sport/bnf/rss/3418`)
