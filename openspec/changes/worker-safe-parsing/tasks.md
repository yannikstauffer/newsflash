## 1. Type Changes

- [ ] 1.1 Add optional `processed?: boolean` field to `NormalizedArticle` in `src/features/connectors/types.ts`

## 2. Environment-Aware Utilities

- [ ] 2.1 Add `DOMParser` feature detection to `stripHtml` in `src/utils/strip-html.ts` — return raw HTML when `DOMParser` is unavailable
- [ ] 2.2 Update `src/utils/__tests__/strip-html.test.ts` — add test cases for the no-`DOMParser` fallback path
- [ ] 2.3 Add `DOMParser` feature detection to `extractLeadingImage` in `src/utils/extract-leading-image.ts` — return `{ imageUrl: undefined, html: input }` when `DOMParser` is unavailable
- [ ] 2.4 Update `src/utils/__tests__/extract-leading-image.test.ts` — add test cases for the no-`DOMParser` fallback path

## 3. Parser Integration

- [ ] 3.1 Set `processed` flag in `parseRssItems` and `parseAtomEntries` in `src/features/connectors/base-parser.ts` — derive value from whether `DOMParser` is available (same check the utilities use)
- [ ] 3.2 Update `src/features/connectors/sources/connectors.test.ts` — verify `processed: true` is set on parsed articles

## 4. Main-Thread Fixup

- [ ] 4.1 Create `ensureProcessed` helper function (can live in `src/features/feed/hooks/use-feed-data.ts` or a separate utility) — runs `extractLeadingImage` then `stripHtml` on articles with `processed !== true`, preserves existing `imageUrl` if present
- [ ] 4.2 Apply `ensureProcessed` in the initial IDB read path in `use-feed-data.ts` (the `useEffect` load function, before first `setArticles`)
- [ ] 4.3 Apply `ensureProcessed` to cached articles in `applyFetchResult` and `refresh` callbacks
- [ ] 4.4 Update `src/features/feed/hooks/use-feed-data.test.ts` — add tests for fixup of unprocessed articles (description stripped, imageUrl extracted, processed flag set to true) and passthrough of already-processed articles

## 5. Quality Gates

- [ ] 5.1 Run `npm run lint` and fix any issues
- [ ] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 5.3 Run `npm run test` and fix any issues
- [ ] 5.4 Run `npm run test:e2e` and fix any issues
- [ ] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
