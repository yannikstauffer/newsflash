## ADDED Requirements

### Requirement: Sticky filter bar positioning
The filter bar SHALL be pinned to the top of the viewport using `position: sticky` with `top: 0` so it remains visible while the user scrolls through articles. The filter bar SHALL have a background color matching the page background and a `z-index` sufficient to layer above scrolling content. A subtle bottom border SHALL visually separate the sticky bar from scrolling content below.

#### Scenario: Filter bar stays visible on scroll
- **WHEN** the user scrolls down through the article list
- **THEN** the filter bar (controls row and day navigation) SHALL remain pinned at the top of the viewport

#### Scenario: Content does not bleed through sticky bar
- **WHEN** article cards scroll behind the sticky filter bar
- **THEN** the filter bar SHALL have an opaque background that fully obscures content beneath it

#### Scenario: Visual separator between sticky bar and content
- **WHEN** the filter bar is in its sticky position
- **THEN** a subtle bottom border SHALL be visible to separate the bar from scrolling content

### Requirement: Refresh timestamp outside sticky bar
The "Refreshed just now" status text SHALL be rendered outside the sticky filter bar, in the feed page content area between the filter bar and the article list. It SHALL scroll away with the article content.

#### Scenario: Refresh text scrolls with content
- **WHEN** the user scrolls down through articles
- **THEN** the "Refreshed just now" text SHALL scroll away with the content, not remain pinned

#### Scenario: Refresh text positioned between filter bar and articles
- **WHEN** the feed page is rendered
- **THEN** the refresh timestamp SHALL appear below the sticky filter bar and above the first article card, centered horizontally

### Requirement: Article counter in sticky bar
The article counter (e.g., "27 articles") SHALL remain in the filter bar's controls row (Row 1) so it is always visible while scrolling.

#### Scenario: Article counter visible while scrolling
- **WHEN** the user scrolls through articles
- **THEN** the article counter SHALL remain visible in the sticky filter bar
