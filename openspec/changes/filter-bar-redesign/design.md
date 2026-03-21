## Context

The filter bar in `src/features/feed/components/filter-bar.tsx` currently renders all controls in a single `flex-wrap` row: toggle buttons (with full text), day navigation, search input, and a trailing "Refreshed" timestamp. On mobile viewports (< 768px), the row wraps awkwardly — buttons take excessive horizontal space, the search input gets squeezed, and the refresh status floats to the end with no clear visual hierarchy.

The filter bar already follows mobile-first responsive patterns (44px touch targets on mobile, `md:` overrides for desktop). The day navigation is conditionally rendered based on `allArticles` state.

## Goals / Non-Goals

**Goals:**
- Improve mobile UX by reducing horizontal space consumed by filter controls
- Establish a clear two-row layout: filters + status on row 1, day navigation on row 2
- Add article count feedback so users see the effect of their filters instantly
- Keep desktop experience largely unchanged (controls just get more breathing room)

**Non-Goals:**
- Changing filter logic or adding new filter types
- Redesigning the day navigation interaction (e.g., calendar picker, swipe gestures)
- Adding a "Today" quick-jump button
- Changing the search algorithm or behavior

## Decisions

### 1. Responsive button text via hidden/block utility classes

**Decision:** Use Tailwind `hidden md:inline` on button text spans, rendering icon-only on mobile and icon + text on desktop. No JavaScript media queries needed.

**Why:** This is the simplest approach — pure CSS, no state, no hydration mismatch risk. The `List` icon for "All articles" and `Eye`/`EyeOff` for "Hidden" are semantically clear on their own. `aria-label` attributes ensure accessibility when text is hidden.

**Alternative considered:** Rendering two separate button elements and toggling visibility. Rejected — doubles DOM nodes for no benefit.

### 2. Search collapse via React state (mobile only)

**Decision:** Add a `searchOpen` boolean state to `FilterBar`. On mobile, render a search icon button; when tapped, set `searchOpen = true`, which renders the full-width input and hides other row-1 controls. On desktop (`md:+`), the search input is always visible regardless of state.

**Why:** CSS-only collapse is insufficient here — we need to auto-focus the input on expand, handle the close/clear interaction, and conditionally hide sibling controls. A simple boolean state keeps it manageable.

**Implementation detail:** Use `md:hidden` / `md:flex` to ensure the toggle button only appears on mobile and the persistent search only appears on desktop. The `searchOpen` state only affects the mobile layout.

### 3. Article count derived from existing filter pipeline

**Decision:** Pass `articleCount` (non-hidden count) and `hiddenCount` as new props to `FilterBar`. Compute them in `useFeedPage` from the already-filtered results.

**Why:** The filter pipeline already computes these lists. `articleCount` is simply the length of the visible articles array. `hiddenCount` requires a separate count of articles that match all filters except the hidden filter — this means running the filter pipeline once without the hidden exclusion and subtracting.

**Alternative considered:** Computing counts inside FilterBar. Rejected — FilterBar is a presentational component and shouldn't know about filter logic.

### 4. Two-row layout via flex column wrapper

**Decision:** Wrap the filter bar in a `flex flex-col gap-2` container. Row 1 contains status, toggles, and search. Row 2 contains centered day navigation. Row 2 is conditionally rendered (existing `!allArticles` check).

**Why:** Clean separation. Each row is independently laid out. Day navigation gets full width to center properly without competing for space.

### 5. Clear button (✕) behavior

**Decision:** Show an `X` icon button inside the search input when it has focus or contains text. On click: if text is present, clear the text. If text is empty (mobile only), collapse the search bar.

**Why:** Single affordance for two related actions. Users expect ✕ to clear; the collapse-when-empty behavior is a natural extension on mobile where the search was explicitly opened.

## Risks / Trade-offs

- **[Risk] Icon-only buttons may be less discoverable for new users** → Mitigation: `aria-label` for accessibility; tooltip on hover (desktop) could be added later. Icons are standard and widely recognized.
- **[Risk] Search collapse adds interaction complexity on mobile** → Mitigation: The pattern is well-established (iOS Safari, many apps). Visual indicator on collapsed icon when search is active prevents "hidden filter" confusion.
- **[Trade-off] Two-row layout uses more vertical space** → Acceptable: day navigation was already wrapping to a second line on mobile. Making it explicit is cleaner than accidental wrapping.
