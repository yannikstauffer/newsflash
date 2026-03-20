## Context

The current `ArticleCard` uses a `grid-cols-[1fr_auto]` layout with text on the left and an optional thumbnail on the right. Many RSS feeds (especially German news sites) embed an `<img>` tag at the start of their `<description>` or `<content>` field instead of using `media:thumbnail`/`media:content`/`enclosure`. Currently these images are stripped away by `stripHtml()` and lost.

## Goals / Non-Goals

**Goals:**
- Flip the card layout so the thumbnail appears on the left and text on the right
- Left-align all text content consistently
- Extract leading `<img>` tags from description/content HTML as a thumbnail fallback
- Remove extracted images from description text to avoid duplication

**Non-Goals:**
- Changing card interaction behavior (hover, swipe, action buttons)
- Extracting images from the middle or end of descriptions (only leading images)
- Supporting `<picture>` or `<video>` elements — only `<img>` tags
- Changing the `NormalizedArticle` interface (the existing `imageUrl` field is sufficient)

## Decisions

### 1. Image extraction before HTML stripping

**Decision:** Extract leading images in `base-parser.ts` before calling `stripHtml()`, not inside `stripHtml()` itself.

**Rationale:** `stripHtml` is a general-purpose utility that should remain pure (HTML in → text out). Image extraction is feed-parsing logic and belongs in the parser. We'll create a new utility `extractLeadingImage(html)` that returns `{ imageUrl: string | undefined, html: string }` — the extracted URL and the HTML with the leading `<img>` removed.

**Alternative considered:** Modifying `stripHtml` to optionally return extracted images — rejected because it violates single responsibility and complicates the utility's API.

### 2. Image extraction approach — regex vs DOMParser

**Decision:** Use DOMParser to extract the first `<img>` if it appears as the first meaningful element in the HTML.

**Rationale:** Regex is fragile with HTML edge cases (self-closing tags, attributes in various orders, encoded characters). DOMParser handles all these correctly and is already used in `stripHtml`.

### 3. Card grid layout change

**Decision:** Change `grid-cols-[1fr_auto]` to `grid-cols-[auto_1fr]` and move the `<img>` element before the text `<div>` in JSX order.

**Rationale:** Minimal change — just swap column order and reorder children. No new CSS concepts needed.

### 4. Fallback priority for imageUrl

**Decision:** The extraction priority remains: `media:thumbnail` → `media:content` → `enclosure` → leading `<img>` in description. The new extraction is the lowest-priority fallback.

**Rationale:** Dedicated media fields are more reliable and intentional. Inline images are a best-effort fallback.

## Risks / Trade-offs

- **[Risk] Some feeds may have decorative/tracking images at the start of descriptions** → Mitigation: Only extract `<img>` tags with `src` attributes containing common image extensions or reasonable dimensions. Accept that some may be imperfect — this is a heuristic.
- **[Risk] DOMParser not available in non-browser contexts (SSR, tests)** → Mitigation: This is a client-side SPA; DOMParser is always available. For Vitest, jsdom provides it.
- **[Trade-off] Layout flip may initially feel unfamiliar** → Accepted: Left-thumbnail is the dominant pattern in news apps (Google News, Apple News, Feedly).
