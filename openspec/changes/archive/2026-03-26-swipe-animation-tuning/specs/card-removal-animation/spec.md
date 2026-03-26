## Card Removal Animation

### Card slide + fade
- On removal trigger, card translates to ±120% AND fades to opacity 0
- Duration: 200ms
- Easing: ease-out
- Fade is uniform (whole card fades equally)

### Outer collapse (gap closing)
- Starts 100ms after card removal begins (staggered)
- maxHeight collapses from 500px to 0px
- opacity fades from 1 to 0
- Duration: 200ms
- Easing: cubic-bezier(0.2, 0, 0, 1) — fast start, eases in at end
- Total perceived duration: ~300ms from swipe release to gap closed

### Callback timing
- Fires on `transitionend` of outer container opacity
- Fallback setTimeout at 350ms (100ms delay + 200ms animation + 50ms buffer)

### Fade-only mode (button trigger)
- Card stays at translateX(0), fades to opacity 0 over 200ms
- Collapse stagger remains the same (100ms delay)
