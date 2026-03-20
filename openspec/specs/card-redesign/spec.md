## ADDED Requirements

### Requirement: Consistent card layout with optional thumbnail
The article card SHALL use a grid layout with an optional thumbnail on the left and content on the right. When no thumbnail is present, the content SHALL span the full width. The thumbnail SHALL have rounded corners and consistent dimensions.

#### Scenario: Article with thumbnail
- **WHEN** an article has an `imageUrl`
- **THEN** the card SHALL display the thumbnail as a rounded image on the left side with the title, metadata, and description on the right

#### Scenario: Article without thumbnail
- **WHEN** an article has no `imageUrl`
- **THEN** the card content SHALL span the full width with no empty space on the left

### Requirement: Left-aligned text content
All text content within the article card (title, metadata, description) SHALL be left-aligned. No text element SHALL use center or right alignment.

#### Scenario: Text alignment in card
- **WHEN** an article card is rendered
- **THEN** the title, source/time metadata, and description text SHALL all be left-aligned within their container

### Requirement: Clear visual hierarchy in cards
The article card SHALL display elements in a clear hierarchy: title (prominent), metadata line (subdued), description (secondary). The title SHALL be visually distinct from the description through font weight and size differences.

#### Scenario: Visual element ordering
- **WHEN** an article card is rendered
- **THEN** the title SHALL appear first (semibold, larger text), followed by the metadata line (smaller, muted color), followed by the description (regular weight, muted color, max 2 lines)

### Requirement: Card hover and interaction states
The article card SHALL provide visual feedback on hover with a subtle background change and slight elevation (shadow). The card SHALL have a smooth transition between states.

#### Scenario: User hovers over card
- **WHEN** a user hovers over an article card
- **THEN** the card background SHALL change subtly and a light shadow SHALL appear with a smooth transition

### Requirement: Metadata display with source favicon or dot
The metadata line SHALL display: source name, relative time, and optional category, separated by a consistent delimiter. The source name SHALL be visually emphasized.

#### Scenario: Article with category
- **WHEN** an article has source "winfuture", time "8m ago", and category "Ki"
- **THEN** the metadata line SHALL display `winfuture · 8m ago · Ki`

#### Scenario: Article without category
- **WHEN** an article has source "srf" and time "14m ago" with no category
- **THEN** the metadata line SHALL display `srf · 14m ago`
