## 1. Fix array media:content in base parser

- [x] 1.1 Update `extractImageUrl()` in `base-parser.ts` to handle `media:content` as an array — pick first element with valid `@_url`
- [x] 1.2 Add test cases for array `media:content` (single element, multiple elements, no valid URLs)

## 2. Fix anchor-wrapped images in leading image extraction

- [x] 2.1 Update `findLeadingImg()` in `extract-leading-image.ts` to unwrap `<a>` tags containing `<img>` at top-level and inside `<p>` containers
- [x] 2.2 Update image removal logic to remove `<a>` wrapper (and parent `<p>` if empty) when extracting anchor-wrapped images
- [x] 2.3 Add test cases for `<a><img></a>` at top level and `<p><a><img></a></p>` pattern
