## MODIFIED Requirements

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
