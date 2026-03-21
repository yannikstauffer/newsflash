## Spec: Read List Counter Badge

### Requirements

1. A counter badge MUST be displayed on the Read List nav icon when the read list contains 1 or more articles
2. The badge MUST be hidden when the read list is empty (0 articles)
3. Counts above 99 MUST display as "99+"
4. The badge MUST use a subtle muted style (`bg-muted text-muted-foreground`)
5. The badge MUST be pill-shaped (rounded-full)
6. The nav link `aria-label` MUST include the count when non-zero (e.g., "Read List (3 saved)")
7. The badge element MUST have `aria-hidden="true"`
8. The badge MUST work in both top nav (desktop) and bottom nav (mobile) positions

### Acceptance Criteria

- [ ] Badge shows correct count matching read list length
- [ ] Badge is not visible when read list is empty
- [ ] Badge shows "99+" for counts over 99
- [ ] Badge uses muted, non-attention-grabbing colors
- [ ] Screen reader announces count via nav link aria-label
- [ ] Badge updates reactively when articles are added/removed
- [ ] Badge renders correctly in both mobile and desktop nav positions
