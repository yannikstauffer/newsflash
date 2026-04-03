## Why

On desktop, the article card description is always clamped to 2 lines regardless of how long the title is. When the title fits on a single line, there is unused vertical space that could show more preview text. The card height also varies depending on title length, which hurts visual consistency in the feed list.

## What Changes

- **Fixed-height title+description container**: On desktop (`md:` breakpoint), the combined title and description area uses a fixed height (`92px`) with flexbox layout. The title takes its natural height (1 or 2 lines), and the description fills the remaining space.
- **Gradient fade on description overflow**: Instead of hard truncation with ellipsis, the description uses a CSS `mask-image` gradient to smoothly fade out overflowing text.
- **Mobile unchanged**: Mobile layout retains current behavior (title with `line-clamp-4`, description hidden).

## Capabilities

### New Capabilities

- `card-description-clamp`: Dynamic description clamping on desktop — 3 lines when title is 1 line, 2 lines when title is 2 lines — using a fixed-height flexbox container with gradient fade.

### Modified Capabilities

- `card-redesign`: Description changes from static `md:line-clamp-2` to dynamic overflow with gradient fade. Title retains `md:line-clamp-2`.

## Impact

- **Components**: `article-card.tsx` (layout restructuring of title+description area on desktop)
- **Styles**: New CSS `mask-image` for gradient fade (inline Tailwind arbitrary value or utility class)