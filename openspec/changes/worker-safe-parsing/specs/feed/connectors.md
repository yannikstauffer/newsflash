## MODIFIED Requirements

### Requirement: Connector parses XML into normalized articles
Each Connector SHALL expose a `parse(xml: string): NormalizedArticle[]` method. When `parse()` is called with valid RSS or Atom XML, it SHALL return an array of `NormalizedArticle` objects with `id`, `title`, `description`, `link`, `publishedAt`, `source`, `language`, optional `imageUrl`, optional `category`, and a `processed` boolean indicating whether HTML utilities had access to `DOMParser` during parsing.

#### Scenario: Connector parses XML with DOMParser available
- **WHEN** `parse()` is called with valid RSS XML in a context where `DOMParser` is available
- **THEN** it SHALL return articles with `description` containing stripped plain text, `imageUrl` extracted from XML attributes or inline HTML, and `processed` set to `true`

#### Scenario: Connector parses XML without DOMParser
- **WHEN** `parse()` is called with valid RSS XML in a context where `DOMParser` is not available (service worker)
- **THEN** it SHALL return articles with `description` containing raw HTML, `imageUrl` extracted from XML attributes only (inline HTML images not extracted), and `processed` set to `false`
