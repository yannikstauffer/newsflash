## Context

The article card (`article-card.tsx`) currently uses `md:line-clamp-2` on both the title and description on desktop. This means a card with a short (1-line) title wastes vertical space while the description is still clamped to 2 lines. The card height also varies based on title length, hurting visual consistency in the feed list.

The card uses Tailwind utility classes throughout. The title is `text-base` (16px/24px line-height) and the description is `text-sm` (14px/20px line-height). There is a `mb-1` (4px) gap between title and description.

## Goals / Non-Goals

**Goals:**
- Make description clamping dynamic based on title length on desktop (`md:`)
- Achieve consistent card height for the title+description area
- Use a pure CSS approach — no JavaScript measurement or observers
- Apply to both cards with and without images

**Non-Goals:**
- Changing mobile layout (stays as-is: `line-clamp-4` title, hidden description)
- Modifying title truncation behavior (`md:line-clamp-2` stays)
- Changing the metadata line, image, or actions layout

## Decisions

### 1. Fixed-height flexbox container over JS measurement

**Decision:** Wrap title and description in a `flex flex-col` container with a fixed height of `92px` on desktop. Title is `flex-none`, description is `flex-1 overflow-hidden`.

**Rationale:** Pure CSS, zero runtime cost, no layout shift. The fixed height is derived from the worst case: 2-line title (48px) + gap (4px) + 2-line description (40px) = 92px. With a 1-line title, 64px remains for description (~3.2 lines), and the gradient fade handles the partial line.

**Alternative considered:** ResizeObserver to measure title height and dynamically set `line-clamp-2` or `line-clamp-3` on description. More precise but adds JS overhead, potential layout shift on first render, and complexity for a marginal visual difference.

### 2. Gradient fade over hard truncation

**Decision:** Use CSS `mask-image` with a linear gradient to fade out overflowing description text instead of `line-clamp` with ellipsis.

**Rationale:** Since the description uses `overflow-hidden` on a flex child (not `line-clamp`), there's no built-in ellipsis. A gradient fade is visually cleaner than a hard cutoff — it signals "there's more text" without an abrupt edge. The fade zone covers the bottom ~12px (`0.75rem`).

```css
mask-image: linear-gradient(to bottom, black calc(100% - 0.75rem), transparent);
```

**Alternative considered:** Combining `line-clamp` with the flex layout — but `line-clamp` sets its own height via `-webkit-box` display, which conflicts with `flex-1` growth behavior.

### 3. Container height of 92px

**Decision:** Use `92px` as the fixed container height on desktop.

**Rationale:** This is the exact height needed for the maximum content case (2-line title + 2-line description):

```
2-line title: 2 × 24px = 48px
gap (mb-1):   4px
2-line desc:  2 × 20px = 40px
total:        92px
```

For a 1-line title, 64px remains for description (3.2 lines of `text-sm`). The 0.2-line overshoot is invisible thanks to the gradient fade.

### 4. Desktop-only via responsive prefix

**Decision:** Apply the fixed-height container and gradient fade only at `md:` breakpoint using Tailwind responsive prefixes. Mobile retains current classes untouched.

**Rationale:** Mobile cards have a different design intent — compact with no description shown. Applying fixed heights on mobile would waste space on small screens.

## Risks / Trade-offs

**[Custom font or zoom breaks height]** → The 92px height assumes default Tailwind `text-base`/`text-sm` line-heights. Custom fonts with different metrics or browser zoom could cause slight misalignment. Mitigation: The gradient fade is forgiving — it masks any partial line overflow regardless of exact pixel values. At extreme zoom levels, the card still degrades gracefully.

**[No ellipsis indicator]** → Unlike `line-clamp` which shows `…`, the gradient fade doesn't add an explicit "text continues" marker. Mitigation: The fade-to-transparent effect is a widely understood visual pattern for truncated content (used in Apple Music, Spotify, etc.). It's arguably more elegant than ellipsis for preview text.

**[Tailwind arbitrary values]** → The `mask-image` gradient and `92px` height require Tailwind arbitrary value syntax (`md:h-[92px]`, `md:[mask-image:...]`), which is less readable than named utilities. Mitigation: These are isolated to one component and the design doc explains the values.
