## Why

On mobile, article card titles are truncated to 2 lines (`line-clamp-2`), causing loss of context. The content preview and action icons consume space that could be better used for the title. Since hide/bookmark actions are already accessible via swipe gestures on mobile, showing the icon buttons is redundant.

## What Changes

- **Title clamp relaxed on mobile**: Increase from `line-clamp-2` to `line-clamp-4` on mobile viewports, keeping `line-clamp-2` on desktop
- **Title weight reduced on mobile**: Use `font-medium` instead of `font-semibold` on mobile to visually lighten the expanded title; desktop stays `font-semibold`
- **Description hidden on mobile**: Remove the content preview paragraph on mobile viewports; desktop continues showing it with `line-clamp-2`
- **Thumbnail enlarged to 96x96 square**: Increase from 64x64 (mobile) and 96x80 (desktop) to a uniform 96x96 square on all viewports
- **Action buttons hidden on small touch devices**: Hide the hide/bookmark icon buttons when the device is both touch-capable AND below the `md` breakpoint; desktop and large touch devices (tablets, touchscreen laptops) continue showing buttons on hover/focus

## Capabilities

### New Capabilities

- `mobile-card-layout`: Mobile-specific article card layout optimizations (title clamp, description visibility, thumbnail sizing, action button visibility)

### Modified Capabilities

- `card-redesign`: Visual hierarchy and card layout requirements change for mobile viewports (title weight, thumbnail dimensions, description visibility)
- `article-actions`: Action button visibility rules change — buttons hidden on small touch devices where swipe gestures are available

## Impact

- `src/features/feed/components/article-card.tsx` — title classes, description visibility, thumbnail sizing
- `src/features/article-actions/components/article-action-buttons.tsx` — conditional visibility logic combining touch detection and breakpoint
