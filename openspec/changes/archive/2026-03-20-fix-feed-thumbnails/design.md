## Context

The base parser's `extractImageUrl()` handles `media:content` as a single object, but Engadget's RSS has multiple `<media:content>` siblings which `fast-xml-parser` returns as an array. The `extractLeadingImage()` utility handles `<p><img></p>` but not `<p><a><img></a></p>`, which is Heise's feed format.

## Goals / Non-Goals

**Goals:**
- Extract thumbnails from Engadget's array-style `media:content` elements
- Extract thumbnails from Heise's `<a>`-wrapped inline images
- Maintain backward compatibility with all existing feed sources

**Non-Goals:**
- Changing image rendering or sizing in the UI
- Adding new feed sources
- Handling deeply nested image structures beyond `<p><a><img></a></p>`

## Decisions

### 1. Array `media:content` handling

When `media:content` is an array, pick the **first element** with a valid `@_url`. This is consistent with how most feeds order their media (primary image first). We considered filtering by `media:keywords === "headline"` but that's Engadget-specific and fragile.

### 2. `<a>`-wrapped image extraction

Extend `findLeadingImg()` to recognize `<a>` containing an `<img>` as a valid leading image pattern — both at top-level body and inside `<p>`. When removing the extracted image, remove the entire `<a>` wrapper (not just the `<img>`). This is a widely used feed pattern (image linking to the article), not Heise-specific.

## Risks / Trade-offs

- **Array first-element assumption** → Could pick a non-primary image if feeds order differently. Mitigated by this being the standard convention.
- **Broader `<a><img>` matching** → Could extract images that are actually navigation links, not thumbnails. Mitigated by only matching at the leading position (first meaningful element).
