## Why

Atom feeds commonly put rich HTML (including thumbnail images) in `<content>` while `<summary>` contains plain text. The Atom parser currently reads `summary ?? content` for image extraction, so when `summary` exists (even without images), it never checks `content`. This causes heise and potentially other Atom feeds to lose their thumbnail images.

## What Changes

- The Atom entry parser will check both `content` and `summary` fields for inline images, preferring whichever contains an extractable image
- Description text continues to prefer `summary` (shorter, better for feed lists)
- No changes to RSS 2.0 parsing or the image extractor itself

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `inline-image-extraction`: Atom entries must check `content` field for images when `summary` yields none

## Impact

- `src/features/connectors/base-parser.ts` — `parseAtomEntries()` function
- `src/features/connectors/base-parser.test.ts` — new test cases for Atom content-field image extraction
- Existing specs: `inline-image-extraction` gains Atom-specific scenarios
