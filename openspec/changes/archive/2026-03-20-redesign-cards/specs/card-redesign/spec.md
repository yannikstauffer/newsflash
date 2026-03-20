## MODIFIED Requirements

### Requirement: Consistent card layout with optional thumbnail
The article card SHALL use a grid layout with an optional thumbnail on the left and content on the right. When no thumbnail is present, the content SHALL span the full width. The thumbnail SHALL have rounded corners and consistent dimensions.

#### Scenario: Article with thumbnail
- **WHEN** an article has an `imageUrl`
- **THEN** the card SHALL display the thumbnail as a rounded image on the left side with the title, metadata, and description on the right

#### Scenario: Article without thumbnail
- **WHEN** an article has no `imageUrl`
- **THEN** the card content SHALL span the full width with no empty space on the left

## ADDED Requirements

### Requirement: Left-aligned text content
All text content within the article card (title, metadata, description) SHALL be left-aligned. No text element SHALL use center or right alignment.

#### Scenario: Text alignment in card
- **WHEN** an article card is rendered
- **THEN** the title, source/time metadata, and description text SHALL all be left-aligned within their container
