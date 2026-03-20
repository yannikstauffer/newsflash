## Why

The current card layout places the thumbnail on the right and doesn't extract inline images from article descriptions. Many RSS feeds embed an image at the start of their description text rather than providing a dedicated media field. Moving the thumbnail to the left and left-aligning all text creates a more natural reading flow (image → text), while extracting embedded images increases thumbnail coverage across feeds.

## What Changes

- **Card layout flip**: Move the thumbnail from the right column to the left column, so cards read as `[thumbnail | text]` instead of `[text | thumbnail]`
- **Left-align all text**: Ensure title, metadata, and description are consistently left-aligned (remove any centering)
- **Inline image extraction**: During feed parsing, detect and extract `<img>` tags at the beginning of description/content HTML as the article's `imageUrl` (before stripping HTML), as a fallback when no `media:thumbnail`, `media:content`, or `enclosure` image is present
- **Strip extracted image from description**: When an image is extracted from description text, remove it from the description to avoid duplication

## Capabilities

### New Capabilities
- `inline-image-extraction`: Extract leading `<img>` tags from article description/content HTML as thumbnail fallback during feed parsing

### Modified Capabilities
- `card-redesign`: Change card grid layout to place thumbnail on the left; ensure all text is left-aligned

## Impact

- `src/features/feed/components/article-card.tsx` — Grid layout change (thumbnail column moves from right to left)
- `src/features/connectors/base-parser.ts` — New fallback in `extractImageUrl` to parse leading `<img>` from description HTML
- `src/utils/strip-html.ts` or new utility — May need a function to extract and remove leading images before stripping HTML
- `openspec/specs/card-redesign/spec.md` — Existing spec needs update for new layout direction
