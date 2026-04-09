## Why

The periodic background sync handler in `src/sw.ts` calls `fetchAndParseAllFeeds()`, which transitively imports `stripHtml` and `extractLeadingImage`. Both use `DOMParser`, which is not available in the service worker runtime. This causes the periodic sync to silently fail (caught by try/catch), so the IndexedDB article cache is never pre-warmed. The entire background sync feature is effectively broken.

## What Changes

- Make `stripHtml` environment-aware: use `DOMParser` when available (main thread), return raw HTML when not (service worker)
- Make `extractLeadingImage` environment-aware: use `DOMParser` when available, skip inline image extraction when not (returns `undefined` for `imageUrl`, preserves original HTML)
- Add a `processed` flag to `NormalizedArticle` so the main thread can identify SW-written articles that need fixup
- Add a synchronous fixup step in `use-feed-data.ts` that processes unprocessed articles from IDB before first render (runs `stripHtml` + `extractLeadingImage` in the main thread where `DOMParser` is available)
- No new dependencies

## Capabilities

### New Capabilities

- `worker-safe-parsing`: Environment-aware HTML utilities that gracefully degrade in service worker context, plus a main-thread fixup mechanism for articles written by the SW

### Modified Capabilities

- `feed/connectors`: `NormalizedArticle` gains an optional `processed` field; `stripHtml` and `extractLeadingImage` become environment-aware
- `feed/data-caching`: `use-feed-data.ts` gains a fixup step that processes unprocessed IDB articles before rendering

## Impact

- `src/utils/strip-html.ts` — Add `DOMParser` feature detection, return raw HTML in SW context
- `src/utils/extract-leading-image.ts` — Add `DOMParser` feature detection, skip extraction in SW context
- `src/features/connectors/types.ts` — Add optional `processed` field to `NormalizedArticle`
- `src/features/connectors/base-parser.ts` — Set `processed: true` (always, since it runs in whatever context called it and the flag reflects whether HTML was actually processed)
- `src/features/feed/hooks/use-feed-data.ts` — Add `ensureProcessed` map step before `setArticles` for IDB-sourced articles
- `src/lib/article-cache.ts` — Store/retrieve the `processed` field in IDB schema
- Existing tests for strip-html, extract-leading-image, base-parser, and use-feed-data need updates