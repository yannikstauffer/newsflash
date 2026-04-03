## MODIFIED Requirements

### Requirement: Connector interface defines a uniform contract for all feed sources
Each Connector SHALL expose an `id` (unique string), `name` (display name), `language` ("de" or "en"), `feeds` (array of feed configurations), a `parse(xml: string): NormalizedArticle[]` method, and an optional `filters` (readonly array of `ArticleFilter`).

#### Scenario: Connector provides metadata
- **WHEN** a connector is registered
- **THEN** it SHALL have a unique `id`, a human-readable `name`, a `language` of "de" or "en", and at least one feed in `feeds`

#### Scenario: Connector parses XML into normalized articles
- **WHEN** `parse()` is called with valid RSS or Atom XML
- **THEN** it SHALL return an array of `NormalizedArticle` objects with `id`, `title`, `description`, `link`, `publishedAt`, `source`, `language`, and optional `imageUrl` and `category`

#### Scenario: Connector optionally defines filters
- **WHEN** a connector is registered
- **THEN** it MAY have a `filters` property containing an array of `ArticleFilter` objects
