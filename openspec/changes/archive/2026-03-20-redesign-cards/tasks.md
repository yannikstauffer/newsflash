## 1. Inline Image Extraction

- [x] 1.1 Create `extractLeadingImage(html: string)` utility that uses DOMParser to find and extract a leading `<img>` tag, returning `{ imageUrl: string | undefined, html: string }`
- [x] 1.2 Write tests for `extractLeadingImage` covering: img at start, img wrapped in `<p>`, img after text (not extracted), no img, whitespace before img
- [x] 1.3 Integrate `extractLeadingImage` into `base-parser.ts` — call it on description HTML before `stripHtml`, use extracted URL as lowest-priority fallback after media:thumbnail/media:content/enclosure
- [x] 1.4 Write tests for the updated parser to verify inline image extraction fallback and that dedicated images take priority

## 2. Card Layout Redesign

- [x] 2.1 Update `article-card.tsx` grid layout from `grid-cols-[1fr_auto]` to `grid-cols-[auto_1fr]` and move the `<img>` element before the text `<div>` in JSX
- [x] 2.2 Ensure all text (title, metadata, description) remains left-aligned after the layout change
- [x] 2.3 Adjust action buttons positioning if needed after layout flip
- [x] 2.4 Verify card renders correctly without thumbnail (content spans full width)

## 3. Verification

- [x] 3.1 Run `npm run lint` and fix any issues
- [x] 3.2 Run `npm run test` and ensure all tests pass
- [x] 3.3 Visual check at mobile (320px, 375px) and desktop (1024px, 1440px) breakpoints
