## Why

The current favicon (`public/favicon.svg`) uses 16 layered Gaussian blur filter ellipses to create a holographic glow effect. While visually rich at 48px, the complex filters collapse into an indistinct purple blob at smaller sizes (32px, 16px) and add unnecessary render overhead. A simplified gradient fill will make the icon scale cleanly from 16px to 512px while preserving the brand identity.

## What Changes

- Replace all 16 Gaussian blur filter ellipses and their `<defs>`/`<filter>` blocks with a single linear gradient
- Apply a top-left to bottom-right gradient: `#7e14ff` (deep purple) → `#863bff` (mid purple) → `#47bfff` (accent blue)
- Keep the existing lightning bolt silhouette path exactly as-is
- Remove the alpha mask and all associated filter definitions
- Standalone bolt with no background (unchanged)

## Capabilities

### New Capabilities

- `favicon-gradient`: Clean linear gradient fill for the lightning bolt favicon, replacing complex filter-based rendering

### Modified Capabilities

_None — no existing spec-level behavior changes._

## Impact

- `public/favicon.svg` — full rewrite of SVG internals (path preserved, fills/filters replaced)
- `dist/favicon.svg` — updated on next build
- No runtime code changes, no dependency changes
- Visual change visible across all browser tabs and bookmarks
