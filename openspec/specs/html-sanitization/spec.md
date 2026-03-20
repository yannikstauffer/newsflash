## ADDED Requirements

### Requirement: Strip HTML from article descriptions
The system SHALL strip all HTML tags from RSS feed description content and return clean plain text. HTML entities (e.g., `&amp;`, `&lt;`, `&#39;`) SHALL be decoded to their character equivalents. Consecutive whitespace SHALL be collapsed to a single space, and leading/trailing whitespace SHALL be trimmed.

#### Scenario: Description contains HTML tags
- **WHEN** an RSS item has description `<p>Breaking <strong>news</strong> today</p>`
- **THEN** the parsed article description SHALL be `Breaking news today`

#### Scenario: Description contains img tags with alt text
- **WHEN** an RSS item has description `<img alt="Photo" src="...">Caption text`
- **THEN** the parsed article description SHALL be `Caption text`

#### Scenario: Description contains HTML entities
- **WHEN** an RSS item has description `Tom &amp; Jerry&#39;s adventure`
- **THEN** the parsed article description SHALL be `Tom & Jerry's adventure`

#### Scenario: Description is plain text
- **WHEN** an RSS item has description `No HTML here`
- **THEN** the parsed article description SHALL be `No HTML here`

#### Scenario: Description is empty or undefined
- **WHEN** an RSS item has no description or an empty description
- **THEN** the parsed article description SHALL be an empty string

### Requirement: HTML stripping occurs at parse time
The system SHALL strip HTML from descriptions during RSS feed parsing, not at render time. All consumers of `NormalizedArticle.description` SHALL receive clean plain text.

#### Scenario: Multiple views display clean text
- **WHEN** an article is displayed in the feed list, read list, or search results
- **THEN** the description SHALL contain no HTML tags in any view
