## ADDED Requirements

### Requirement: stripHtml gracefully degrades without DOMParser
The `stripHtml` function SHALL detect whether `DOMParser` is available in the current runtime. When `DOMParser` is available, it SHALL use `DOMParser.parseFromString` to strip HTML tags and decode entities (existing behavior). When `DOMParser` is not available (service worker context), it SHALL return the input HTML string unchanged.

#### Scenario: Main thread uses DOMParser
- **WHEN** `stripHtml` is called with `"<p>Hello &amp; world</p>"` in a context where `DOMParser` is available
- **THEN** it SHALL return `"Hello & world"`

#### Scenario: Service worker returns raw HTML
- **WHEN** `stripHtml` is called with `"<p>Hello &amp; world</p>"` in a context where `DOMParser` is not available
- **THEN** it SHALL return `"<p>Hello &amp; world</p>"`

#### Scenario: Empty input returns empty string in any context
- **WHEN** `stripHtml` is called with an empty string
- **THEN** it SHALL return `""` regardless of runtime context

### Requirement: extractLeadingImage gracefully degrades without DOMParser
The `extractLeadingImage` function SHALL detect whether `DOMParser` is available in the current runtime. When `DOMParser` is available, it SHALL extract the leading image using DOM traversal (existing behavior). When `DOMParser` is not available, it SHALL return `{ imageUrl: undefined, html: originalHtml }`.

#### Scenario: Main thread extracts leading image
- **WHEN** `extractLeadingImage` is called with `"<img src='photo.jpg'><p>Text</p>"` in a context where `DOMParser` is available
- **THEN** it SHALL return `{ imageUrl: "photo.jpg", html: "<p>Text</p>" }`

#### Scenario: Service worker skips extraction
- **WHEN** `extractLeadingImage` is called with `"<img src='photo.jpg'><p>Text</p>"` in a context where `DOMParser` is not available
- **THEN** it SHALL return `{ imageUrl: undefined, html: "<img src='photo.jpg'><p>Text</p>" }`

#### Scenario: Empty input returns undefined in any context
- **WHEN** `extractLeadingImage` is called with an empty string
- **THEN** it SHALL return `{ imageUrl: undefined, html: "" }` regardless of runtime context

### Requirement: Main-thread fixup processes unprocessed articles before display
The feed data hook SHALL process articles with `processed` equal to `false` before setting them in React state. Processing SHALL run `extractLeadingImage` on the article's `description` to recover inline images, then `stripHtml` on the resulting HTML to produce clean text. The fixup SHALL run synchronously before the first `setArticles` call.

#### Scenario: Unprocessed IDB articles are fixed up before render
- **WHEN** articles are read from IndexedDB and some have `processed === false`
- **THEN** those articles SHALL have `stripHtml` and `extractLeadingImage` applied to their `description` before being set in React state
- **AND** the resulting articles SHALL have `processed` set to `true`

#### Scenario: Already-processed articles pass through unchanged
- **WHEN** articles are read from IndexedDB and all have `processed !== false`
- **THEN** they SHALL be set in React state without modification

#### Scenario: Fixup recovers inline images
- **WHEN** an unprocessed article has a leading `<img>` in its `description` and no `imageUrl`
- **THEN** the fixup SHALL extract the image URL into `imageUrl` and remove the `<img>` from the description before stripping HTML

#### Scenario: Fixup preserves existing imageUrl
- **WHEN** an unprocessed article already has an `imageUrl` (from XML attributes)
- **THEN** the fixup SHALL keep the existing `imageUrl` and only strip HTML from the description

### Requirement: Fixup does not write back to IndexedDB
The fixup step SHALL process articles in memory only. It SHALL NOT write processed articles back to IndexedDB. The network fetch cycle is responsible for eventually overwriting SW-written articles with fully processed versions.

#### Scenario: IDB is not modified by fixup
- **WHEN** unprocessed articles are fixed up in the feed data hook
- **THEN** no `upsertMany` or `put` calls SHALL be made to IndexedDB as part of the fixup
