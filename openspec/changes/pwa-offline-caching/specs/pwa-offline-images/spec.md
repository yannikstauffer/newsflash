## ADDED Requirements

### Requirement: Article images are cached by the service worker

The service worker SHALL cache article thumbnail and hero images using a CacheFirst strategy. Once an image is cached, subsequent requests SHALL be served from cache without a network request.

#### Scenario: First view caches the image

- **WHEN** an article card displays a thumbnail image for the first time
- **THEN** the service worker SHALL cache the image response

#### Scenario: Repeat view loads from cache

- **WHEN** an article card displays a thumbnail image that has been previously cached
- **THEN** the image SHALL load from the service worker cache without a network request

#### Scenario: Offline displays cached images

- **WHEN** the user is offline and views an article with a previously cached image
- **THEN** the image SHALL display from the cache

#### Scenario: Uncached image offline shows no broken image

- **WHEN** the user is offline and views an article with an image that was never cached
- **THEN** the image element SHALL handle the failure gracefully (no broken image icon)

### Requirement: Image cache has bounded size

The image cache SHALL be bounded to prevent excessive storage usage.

#### Scenario: Cache size limit

- **WHEN** the image cache exceeds 200 entries
- **THEN** the oldest entries SHALL be evicted to maintain the limit

#### Scenario: Cache age limit

- **WHEN** a cached image is older than 7 days
- **THEN** it SHALL be evicted on the next cache cleanup
