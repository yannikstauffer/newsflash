## Swipe Gesture Detection

### Drag configuration
- `filterTaps: true` — unchanged
- `axis: "x"` — REMOVED
- `threshold: [10, 30]` — NEW asymmetric threshold
  - Horizontal: 10px before drag registers
  - Vertical: 30px before scroll registers
  - Biases toward horizontal swipe detection

### Swipe threshold
- SWIPE_THRESHOLD remains 80px to trigger action
- The 10px threshold is for initial gesture detection, not action trigger

### Scroll behavior
- `touch-pan-y` CSS class remains on the inner element
- Once vertical intent exceeds 30px, native scroll takes over
