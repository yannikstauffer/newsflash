## 1. HTML Sanitization

- [x] 1.1 Create `src/utils/strip-html.ts` utility that uses DOMParser to strip HTML tags, decode entities, and collapse whitespace
- [x] 1.2 Write unit tests for `strip-html` covering: tags, entities, empty input, plain text, img tags
- [x] 1.3 Integrate `stripHtml()` into `base-parser.ts` to clean descriptions at parse time
- [x] 1.4 Verify existing `base-parser.test.ts` still passes; update test expectations if descriptions change

## 2. Article Card Redesign

- [x] 2.1 Refactor `article-card.tsx` layout to use CSS grid (`grid-cols-[1fr_auto]`) for consistent content + thumbnail placement
- [x] 2.2 Improve visual hierarchy: title (semibold, base), metadata (xs, muted), description (sm, muted-foreground, 2-line clamp)
- [x] 2.3 Add rounded corners to thumbnail image and ensure consistent sizing
- [x] 2.4 Add hover state with subtle shadow and smooth background transition (150-200ms)

## 3. Filter Bar Refinement

- [x] 3.1 Reorganize `filter-bar.tsx` into two rows: source buttons + refresh on row 1, language/hidden/search on row 2
- [x] 3.2 Style source buttons as compact pill chips with reduced padding and rounded-full shape
- [x] 3.3 Ensure source buttons wrap on mobile and second row stacks gracefully

## 4. UI Polish

- [x] 4.1 Standardize card gap spacing in `feed-list.tsx` (12px mobile, 16px desktop)
- [x] 4.2 Add subtle default border styling to cards, shadow only on hover
- [x] 4.3 Ensure all interactive elements (buttons, cards, filters) use consistent 150-200ms transitions
- [x] 4.4 Verify typography consistency across all card elements matches the spec

## 5. Verification

- [x] 5.1 Take screenshots at mobile (375px) and desktop (1024px+) to verify responsive layout
- [x] 5.2 Run `npm run lint` and `npm run test` to confirm no regressions
- [x] 5.3 Check JetBrains diagnostics on all changed files
