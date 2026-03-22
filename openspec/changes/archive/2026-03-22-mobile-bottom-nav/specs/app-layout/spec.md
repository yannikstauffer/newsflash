## Spec: App Layout — Mobile Bottom Nav

### Requirements

1. On viewports below `sm` (640px), the main navigation MUST render as a fixed bottom bar
2. On viewports `sm` and above, the main navigation MUST render as a sticky top header (current behavior)
3. The bottom nav MUST always be visible (no auto-hide on scroll)
4. The bottom nav MUST include safe-area padding for iOS home indicator
5. Main content MUST have bottom padding on mobile to prevent overlap with the fixed nav
6. Active nav item MUST show a top border on mobile, bottom border on desktop
7. Touch targets MUST remain minimum 48px
8. Skip-to-content link MUST remain functional
9. Only one `<nav>` landmark with `aria-label="Main navigation"` MUST exist in the DOM
10. Nav item labels MUST remain hidden on mobile, visible on `sm`+

### Acceptance Criteria

- [ ] Navigation appears at bottom of screen on mobile viewports
- [ ] Navigation appears at top of screen on desktop viewports
- [ ] Bottom nav does not hide on scroll
- [ ] Content is not hidden behind the bottom nav
- [ ] iOS devices with home indicator show proper spacing
- [ ] Active state uses top border (mobile) / bottom border (desktop)
- [ ] All nav items have 48px minimum touch targets
- [ ] Screen reader announces single "Main navigation" landmark
- [ ] Skip-to-content link works in both layouts