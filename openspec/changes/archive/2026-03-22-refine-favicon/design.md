## Context

The current `public/favicon.svg` is a 48×46 SVG containing a lightning bolt path, an alpha mask, and 16 `<filter>` elements with Gaussian blurs and overlapping ellipses to create a holographic glow. The bolt silhouette path itself is clean and well-designed — only the fill treatment needs replacing.

## Goals / Non-Goals

**Goals:**
- Replace all filter-based rendering with a single `<linearGradient>`
- Preserve the exact bolt silhouette `<path>` geometry
- Produce an SVG that renders crisply from 16px to 512px
- Maintain brand color continuity using existing palette colors

**Non-Goals:**
- Changing the bolt shape or viewBox dimensions
- Creating multiple icon sizes or formats (PWA manifest icons, Apple touch icons)
- Adding a background shape or rounded-square container
- Dark mode variant

## Decisions

### 1. Single linear gradient vs. multiple stops with opacity

**Decision:** Single `<linearGradient>` with 3 color stops, no opacity tricks.

- Stop 1 (0%): `#7e14ff` — deep purple, top-left origin
- Stop 2 (50%): `#863bff` — primary purple, midpoint
- Stop 3 (100%): `#47bfff` — accent blue, bottom-right terminus

**Rationale:** Three opaque stops are enough to create the purple-to-blue energy flow. Adding opacity or extra stops would reintroduce the rendering complexity we're eliminating. The 3 colors are already established in the current brand palette.

### 2. Gradient direction: top-left to bottom-right

**Decision:** `x1="0%" y1="0%" x2="100%" y2="100%"` diagonal gradient.

**Rationale:** The diagonal follows the bolt's natural downward-right energy. A vertical or horizontal gradient would fight the shape's directionality. The blue accent landing at the bolt's tip reinforces the "electric discharge" metaphor.

### 3. Remove mask + filters entirely vs. keeping a simplified version

**Decision:** Remove the entire `<mask>`, all `<filter>` elements, and the `<defs>` block (except the gradient definition). Apply the gradient directly to the bolt path's `fill`.

**Alternative considered:** Keeping a single subtle blur for a soft glow effect. Rejected because even one filter degrades at small sizes and adds render cost for minimal visual gain.

## Risks / Trade-offs

- **Visual regression at large sizes** — The current glow effect is more visually striking at 48px+. The simplified gradient will look cleaner but less "premium." → Acceptable trade-off for cross-size consistency.
- **Brand perception** — Users familiar with the current icon may notice the change. → The bolt shape and purple palette are unchanged, so recognition is preserved.
- **No fallback for very old browsers** — SVG `linearGradient` is supported in all modern browsers (IE9+). → No mitigation needed given the project's target audience.
