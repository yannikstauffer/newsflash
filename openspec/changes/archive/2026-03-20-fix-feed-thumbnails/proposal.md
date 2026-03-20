## Why

Engadget and Heise feeds display no article thumbnails. The image extraction logic doesn't handle two common feed patterns: multiple `media:content` elements (parsed as arrays by fast-xml-parser) and `<img>` tags nested inside `<a>` wrappers within `<p>` tags.

## What Changes

- Fix `extractImageUrl()` in `base-parser.ts` to handle `media:content` being an array (pick first element's URL)
- Fix `findLeadingImg()` in `extract-leading-image.ts` to unwrap `<a>` tags when looking for leading `<img>` elements inside `<p>` containers
- Add test cases covering both patterns

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feed-connectors`: `extractImageUrl` SHALL handle `media:content` as both single object and array
- `inline-image-extraction`: Leading image extraction SHALL handle `<img>` nested inside `<a>` tags within `<p>` wrappers

## Impact

- `src/features/connectors/base-parser.ts` — `extractImageUrl()` function
- `src/utils/extract-leading-image.ts` — `findLeadingImg()` function
- Test files for both modules
