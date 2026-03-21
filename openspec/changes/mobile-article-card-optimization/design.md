## Context

The article card (`article-card.tsx`) currently uses identical title clamping, description visibility, and action button visibility across all viewports. On mobile, this leads to truncated titles that lose context, while the description preview and action icons consume space that could be better allocated. Swipe gestures already handle hide/bookmark on mobile via `SwipeableCard`.

Tailwind's responsive prefix system (`md:`) and the existing `touch-device:` custom variant provide the mechanisms needed for all changes.

## Goals / Non-Goals

**Goals:**
- Show more title context on mobile by relaxing the line clamp and removing the description
- Increase thumbnail prominence with a uniform 96x96 square across viewports
- Reduce visual clutter on mobile by hiding action buttons where swipe gestures exist
- Maintain identical desktop experience

**Non-Goals:**
- Redesigning the card layout structure (grid stays as-is)
- Changing swipe gesture behavior
- Modifying the metadata line
- Adding new responsive breakpoints or custom variants

## Decisions

### 1. Use Tailwind responsive prefixes for all mobile/desktop divergence

All changes use base classes for mobile and `md:` overrides for desktop. No new CSS, no JavaScript media queries.

- Title: `line-clamp-4 font-medium md:line-clamp-2 md:font-semibold`
- Description: `hidden md:block` wrapper or conditional class
- Thumbnail: `size-24` uniform (replacing `size-16 md:h-20 md:w-24`)

**Rationale**: Consistent with existing responsive patterns in the codebase. Zero runtime cost.

### 2. Action button visibility: combine `touch-device:` with `md:` breakpoint

Current visibility: `hidden group-hover:flex group-focus-within:flex touch-device:flex`

New visibility: `hidden group-hover:flex group-focus-within:flex touch-device:md:flex`

Adding `md:` to the `touch-device:` variant ensures buttons only appear on touch devices at `md` and above. Small touch devices (phones) rely on swipe. The `group-hover:flex` and `group-focus-within:flex` remain unchanged — these only trigger on non-touch devices anyway.

**Rationale**: Tailwind supports stacking variants (`touch-device:md:flex`). This is the simplest approach with no JS logic needed.

### 3. Uniform 96x96 square thumbnail

Replace the current mobile 64x64 / desktop 96x80 split with a single `size-24` (96x96) and update HTML attributes to `width={96} height={96}`.

**Rationale**: Simplifies the CSS, improves visual consistency across breakpoints, and gives thumbnails more visual weight on mobile where the description is removed.

## Risks / Trade-offs

- **Long titles on mobile**: `line-clamp-4` allows up to 4 lines. Some RSS feeds have very long titles, but the clamp provides a safety net. → Acceptable trade-off: 4 lines is enough for context without dominating the viewport.
- **Larger thumbnails increase data usage**: 96x96 images on mobile vs previous 64x64. → Minimal impact: images are already loaded at source resolution and CSS-scaled; no additional network request.
- **Touch detection accuracy**: `touch-device:` relies on `@media (pointer: coarse)` or similar. Hybrid devices (Surface, iPad with keyboard) may behave unexpectedly. → Mitigated by also requiring `md:` breakpoint — large touch devices always show buttons regardless.
