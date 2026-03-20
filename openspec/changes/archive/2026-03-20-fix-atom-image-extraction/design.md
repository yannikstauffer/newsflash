## Context

The Atom parser in `base-parser.ts` reads article HTML from `entry.summary ?? entry.content` (line 152). This single expression is used for both description text and inline image extraction. Atom feeds like heise put plain text in `<summary>` and rich HTML (with `<p><a><img></a></p>`) in `<content>`. Since `summary` exists, the nullish coalescing never reaches `content`, and the image is lost.

## Goals / Non-Goals

**Goals:**
- Atom entries extract inline images from `content` when `summary` yields no image
- Description text still prefers `summary` for cleaner feed list display
- No changes to RSS 2.0 parsing path

**Non-Goals:**
- Changing the image extractor itself (`extract-leading-image.ts`)
- Adding per-connector configuration for extraction behavior
- Handling non-leading images from either field

## Decisions

### Separate image extraction from description extraction for Atom entries

Currently one expression (`entry.summary ?? entry.content`) serves both purposes. The fix splits these concerns:

1. **Description text**: `extractText(entry.summary ?? entry.content)` — unchanged, prefers shorter summary
2. **Inline image extraction**: Try `content` first (richer HTML), fall back to `summary` if no image found in content

**Why content-first for images**: Atom's `<content>` is designed for the full representation including media. `<summary>` is explicitly a text-only synopsis. Checking content first aligns with the Atom spec's intent.

**Alternative considered**: Try `summary` first, fall back to `content`. Rejected because it adds an unnecessary extraction attempt — if `summary` is plain text (the common case), the extractor parses HTML for nothing.

## Risks / Trade-offs

- [Edge case: content has a different leading image than summary] → Low risk. Atom feeds rarely duplicate images across both fields. Content-first is the correct priority.
- [Extra `extractLeadingImage` call when content exists but has no image] → Negligible performance impact; parsing a small HTML fragment is fast.
