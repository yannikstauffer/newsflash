## Context

The periodic background sync feature (`src/sw.ts`) reuses the same feed pipeline as the main thread to pre-warm the IndexedDB article cache. However, `stripHtml` and `extractLeadingImage` both rely on `DOMParser`, which does not exist in the service worker runtime. The sync handler's try/catch silently eats the resulting `ReferenceError`, so background sync never writes articles to IDB.

The main thread reads articles from IDB via `articleCache.getAll()` and renders them directly — no re-processing occurs. This means whatever the SW writes to IDB is shown as-is in the UI.

Key files:
- `src/utils/strip-html.ts` — `new DOMParser()` for HTML tag removal and entity decoding
- `src/utils/extract-leading-image.ts` — `new DOMParser()` for leading `<img>` extraction
- `src/features/connectors/base-parser.ts` — calls both utilities during `parseRss()`
- `src/lib/feed-pipeline.ts` — shared pipeline used by main thread and SW
- `src/features/feed/hooks/use-feed-data.ts` — reads IDB articles, renders without processing
- `src/lib/article-cache.ts` — IDB storage layer, `CachedArticle` extends `NormalizedArticle`

## Goals / Non-Goals

**Goals:**
- Make the feed parsing pipeline runnable in the service worker context without errors
- Ensure articles written by the SW are displayed correctly in the main thread (clean text descriptions, extracted images where possible)
- Zero new dependencies — solve with feature detection and a main-thread fixup step
- Keep the main-thread parsing path unchanged (DOMParser remains the primary path)

**Non-Goals:**
- Full DOM-fidelity parsing in the SW (regex/library-based HTML parsing) — out of scope
- Writing processed articles back to IDB from the fixup step — adds race condition complexity for negligible benefit
- Chunked/async processing of unprocessed articles — 200ms worst case is within acceptable thresholds

## Decisions

### Decision 1: Feature-detect `DOMParser` in utility functions

**Choice:** `stripHtml` and `extractLeadingImage` check `typeof DOMParser !== "undefined"` and gracefully degrade.

- `stripHtml` without `DOMParser`: returns raw HTML unchanged
- `extractLeadingImage` without `DOMParser`: returns `{ imageUrl: undefined, html: originalHtml }`

**Why not regex fallback?** `stripHtml` could be done with regex, but `extractLeadingImage` handles complex DOM traversal (nested `<a><img>`, `<p>` wrappers, whitespace text nodes). A regex version would be fragile and hard to test. Returning raw/undefined is simpler and the fixup step handles it.

**Why not `htmlparser2` or `linkedom`?** Adds 7-30KB to the SW bundle for a problem solvable without dependencies. The SW-written articles are temporary — the main thread overwrites them on next online fetch.

### Decision 2: Explicit `processed` flag on `NormalizedArticle`

**Choice:** Add `processed?: boolean` to `NormalizedArticle`. The flag is set by `base-parser.ts` based on whether `DOMParser` was available during parsing.

**Why not a `looksLikeHtml()` heuristic?** A regex like `/<[a-z][\s\S]*>/i` could detect HTML in `description`, but has edge cases (text containing angle brackets). The explicit flag is ~5 lines more code and eliminates all ambiguity.

**Three-way handling in `ensureProcessed`:**
- `processed === true` → pass through unchanged.
- `processed === false` → run the full `extractLeadingImage` + `stripHtml` fixup pipeline.
- `processed === undefined` (pre-flag legacy IDB entries) → stamp `processed: true` but preserve `description`/`imageUrl` as-is. These entries were already processed by the main thread when they were written (pre-PR code path), so re-running `stripHtml` would be unsafe: a decoded description containing literal `<...>` text (e.g., `Use <b> to bold` from an earlier decoded `&lt;b&gt;`) would be re-interpreted as a tag and stripped, corrupting the content.

After fixup, every article in memory has `processed === true`, giving a clean invariant without risking data corruption for legacy entries.

### Decision 3: Synchronous fixup before first `setArticles`

**Choice:** In `use-feed-data.ts`, map IDB articles through an `ensureProcessed()` function before calling `setArticles`. This runs `stripHtml` + `extractLeadingImage` on any article with `processed !== true`.

The fixup is applied at three points:
1. Initial IDB read in the `useEffect` (line ~180, before first render of cached data)
2. The `applyFetchResult` callback (for the cached articles half of the merge)
3. The `refresh` callback (same as above)

**Why synchronous?** `DOMParser.parseFromString` on short RSS snippets is sub-millisecond. Even 500 articles takes ~200ms — within the "instant" perception threshold. The alternative (async with loading state) defeats the purpose of the IDB cache (instant render).

**Why not write back to IDB?** A fire-and-forget `upsertMany` after fixup would race with the concurrent network fetch that also calls `upsertMany`. Both would write `processed: true` but with potentially different content (network is fresher). Skipping write-back eliminates the race entirely. The cost: repeated offline opens re-process the same articles in memory. This is negligible (~200ms).

### Decision 4: No IDB schema migration needed

The `processed` field is optional on `NormalizedArticle`. The IDB object store has no schema validation — it stores whatever is put in. `CachedArticle extends NormalizedArticle`, so the field flows through `toCachedArticle` via spread and back through `toNormalizedArticle` via destructuring (only `pinned`, `pinnedKey`, `cachedAt` are stripped). No DB version bump required.

## Risks / Trade-offs

**[SW-parsed articles have no inline image extraction]** Articles whose only image is embedded in `<description>` HTML (no `media:thumbnail`/`media:content`/`enclosure` in XML) will have `imageUrl: undefined` when written by the SW. The main-thread fixup extracts the image, but only in the `description` field processing — not as a separate image extraction pass. This is acceptable because: (a) most modern feeds provide images via XML attributes, and (b) the fixup runs before render so users see the correct image.
  - Mitigation: The `ensureProcessed` function runs both `extractLeadingImage` and `stripHtml`, so inline images are recovered during fixup.

**[200ms fixup delay on offline cold start]** In the worst case (500 unprocessed articles, user opens app offline), the synchronous fixup delays first paint by ~200ms.
  - Mitigation: This only occurs when: (a) SW background sync ran, (b) user opens app offline, (c) no prior main-thread fetch has overwritten the articles. The scenario is infrequent.

**[`processed` flag is technically redundant after main-thread fetch]** Once the main thread fetches and upserts, all articles have `processed: true`. The flag is only meaningful for the gap between SW write and main-thread overwrite.
  - Mitigation: This is by design. The flag's purpose is narrow and well-defined.
