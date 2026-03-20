## MODIFIED Requirements

### Requirement: Extract leading image from article description
The feed parser SHALL extract the first `<img>` tag from the beginning of an article's description or content HTML and use its `src` attribute as the article's `imageUrl`, when no other image source (media:thumbnail, media:content, enclosure) is available. The `<img>` MAY be wrapped in an `<a>` tag.

#### Scenario: Description starts with an img tag
- **WHEN** an article has no media:thumbnail, media:content, or enclosure image AND the description HTML starts with `<img src="https://example.com/photo.jpg" />`
- **THEN** the article's `imageUrl` SHALL be set to `https://example.com/photo.jpg`

#### Scenario: Description starts with whitespace then img tag
- **WHEN** an article has no dedicated image AND the description HTML starts with whitespace or `<p>` wrapper followed by an `<img>` tag
- **THEN** the parser SHALL still extract the image URL from that `<img>` tag

#### Scenario: Description has img tag in the middle
- **WHEN** an article has no dedicated image AND the description HTML contains an `<img>` tag only after significant text content
- **THEN** the parser SHALL NOT extract that image (only leading images are extracted)

#### Scenario: Article already has a dedicated image
- **WHEN** an article has a media:thumbnail, media:content, or enclosure image
- **THEN** the parser SHALL use the dedicated image and SHALL NOT attempt to extract an inline image

#### Scenario: Img wrapped in anchor tag at top level
- **WHEN** the description HTML starts with `<a href="..."><img src="https://example.com/photo.jpg" /></a>`
- **THEN** the parser SHALL extract `https://example.com/photo.jpg` as the imageUrl

#### Scenario: Img wrapped in anchor tag inside p tag
- **WHEN** the description HTML starts with `<p><a href="..."><img src="https://example.com/photo.jpg" /></a></p>`
- **THEN** the parser SHALL extract `https://example.com/photo.jpg` as the imageUrl

### Requirement: Remove extracted image from description
When a leading image is extracted from description HTML, the parser SHALL remove that `<img>` tag (and its `<a>` wrapper if present) from the HTML before stripping tags, so the description text does not contain a broken reference or empty space.

#### Scenario: Image extracted and removed
- **WHEN** an article description is `<img src="photo.jpg"><p>Article text here</p>`
- **THEN** the extracted imageUrl SHALL be `photo.jpg` AND the stripped description SHALL be `Article text here`

#### Scenario: Anchor-wrapped image extracted and removed
- **WHEN** an article description is `<p><a href="..."><img src="photo.jpg" /></a></p><p>Article text here</p>`
- **THEN** the extracted imageUrl SHALL be `photo.jpg` AND the `<a>` and its parent `<p>` (if now empty) SHALL be removed

#### Scenario: No image to extract
- **WHEN** an article description is `<p>Just text content</p>` with no leading image
- **THEN** the description SHALL be stripped normally as `Just text content` with no imageUrl extracted
