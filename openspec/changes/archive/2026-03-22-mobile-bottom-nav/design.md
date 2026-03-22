## Design

### Approach: Single Component with Responsive Classes

Keep a single `<nav>` element and use Tailwind responsive utilities to switch between bottom-fixed (mobile) and sticky-top (desktop). This avoids duplicating the nav markup or managing two separate components.

**Why not two separate components?** The nav items are identical in both positions. Duplicating the markup creates a maintenance burden and risks accessibility issues (duplicate landmarks). A single `<nav>` with responsive positioning is simpler and semantically correct.

### Layout Structure

```
MOBILE (< sm)                     DESKTOP (≥ sm)
┌───────────────────┐             ┌───────────────────────┐
│ (no top header)   │             │  header (sticky top)  │
│                   │             │  ┌─ nav ────────────┐ │
│   main content    │             │  │ 📰  🔖  ⚙️       │ │
│   pb-[nav-height] │             │  └──────────────────┘ │
│                   │             │                        │
├───────────────────┤             │   main content         │
│  nav (fixed bot)  │             │                        │
│  📰    🔖    ⚙️    │             └────────────────────────┘
│  pb-safe           │
└───────────────────┘
```

### CSS Strategy

The `<nav>` container (currently inside `<header>`) needs to move to a position that can be styled independently:

- **Mobile**: `fixed bottom-0 left-0 right-0 z-10` with `border-t` instead of `border-b`
- **Desktop**: Stays inside `<header>` with `sticky top-0`

Since CSS alone can't move an element between parent containers, the cleanest approach is:
1. Pull the `<nav>` out of the `<header>` wrapper
2. Use responsive classes on the nav itself: `fixed bottom-0 sm:sticky sm:top-0`
3. The `<header>` semantic wrapper gets responsive classes too: contents on mobile, visible on desktop

### Safe Area

```css
padding-bottom: env(safe-area-inset-bottom);
```

Applied via Tailwind's `pb-[env(safe-area-inset-bottom)]` or a custom utility class. This ensures the nav clears the iOS home indicator bar.

### Active Indicator

- **Mobile (bottom nav)**: `border-t-2 border-primary` (top border, pointing toward content)
- **Desktop (top nav)**: `border-b-2 border-primary` (bottom border, current behavior)

### Main Content Padding

Add `pb-16 sm:pb-0` to `<main>` to account for the fixed bottom nav height on mobile (~64px including safe area).

### Accessibility

- Single `<nav aria-label="Main navigation">` — no duplication
- Skip-to-content link remains functional in both layouts
- `aria-current="page"` continues to work unchanged
- Touch targets remain 48px minimum