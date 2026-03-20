## 1. Swap Button Order

- [x] 1.1 In `filter-bar.tsx`, move the "Next day" button (onNext + ChevronRight) to the left position (before the date label) and the "Previous day" button (onPrev + ChevronLeft) to the right position (after the date label)
- [x] 1.2 Verify the `disabled={isToday}` prop remains on the "Next day" button in its new left position

## 2. Update Tests

- [x] 2.1 Update `filter-bar.test.tsx` to assert the new button order (Next day on left, Previous day on right)
- [x] 2.2 Run tests and confirm all pass
