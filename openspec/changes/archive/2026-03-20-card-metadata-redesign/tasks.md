## 1. Time Formatting Utilities

- [x] 1.1 Create `formatAbsoluteTime(date: Date): string` in `format-time.ts` returning `dd.MM.yyyy hh:mm:ss` format
- [x] 1.2 Create `formatShortTime(date: Date): string` in `format-time.ts` returning `dd.MM. hh:mm` format
- [x] 1.3 Remove `formatRelativeTime` function from `format-time.ts`
- [x] 1.4 Write tests for `formatAbsoluteTime` covering standard dates, zero-padding, and edge cases
- [x] 1.5 Write tests for `formatShortTime` covering standard dates, zero-padding, and edge cases
- [x] 1.6 Remove old `formatRelativeTime` tests

## 2. Article Card Metadata Reorder

- [x] 2.1 Move the metadata `div` above the headline `a`/`h3` in `article-card.tsx`
- [x] 2.2 Replace `formatRelativeTime` import with `formatAbsoluteTime` and `formatShortTime`
- [x] 2.3 Render both time formats: full visible on `md+`, short visible below `md` (using Tailwind `hidden`/`md:inline`)
- [x] 2.4 Apply `lowercase` Tailwind class to the metadata container
- [x] 2.5 Wrap category and its preceding middot in a `hidden md:inline` span to hide on mobile
- [x] 2.6 Verify source retains `font-medium` class

## 3. Verification

- [x] 3.1 Run `npm run lint` and fix any issues
- [x] 3.2 Run `npm run test` and verify all tests pass
- [x] 3.3 Run JetBrains diagnostics on changed files
