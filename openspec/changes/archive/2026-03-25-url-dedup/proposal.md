## Why

Articles from different feeds sometimes point to the same URL but have slightly different titles or timestamps (e.g., syndicated content, corrected republishes). The current dedup logic only catches exact title+date matches, so these URL-identical duplicates slip through into the feed.

## What Changes

- Add a second dedup check: if two articles share the same `link` value, treat them as duplicates
- Either check (title+date OR matching URL) is sufficient to filter an article as duplicate
- Move the chronological sort **before** dedup so the youngest (most recent) article always wins when duplicates are found
- Compare URLs raw — no query-param stripping or normalization

## Capabilities

### New Capabilities

None

### Modified Capabilities

- `article-feed`: Add URL-based duplicate detection requirement to the existing dedup behavior

## Impact

- `src/features/feed/hooks/use-feed-data.ts` — update `deduplicateArticles()` and swap sort/dedup call order
- `src/features/feed/hooks/use-feed-data.test.ts` — new test cases for URL dedup and youngest-wins behavior
- `openspec/specs/article-feed/spec.md` — new dedup requirement
