## Context

The filter bar's date navigator currently renders `[← Prev] Date [Next →]`. The left chevron goes to older dates and the right chevron goes to newer dates. The user wants these swapped so that the left button navigates toward today (newer) and the right button navigates toward older dates.

The relevant component is `src/features/feed/components/filter-bar.tsx` (lines 63–89).

## Goals / Non-Goals

**Goals:**
- Swap the visual position and icons of the prev/next buttons in the date navigator
- Update tests to match the new order

**Non-Goals:**
- Changing the date navigation logic itself (onPrev/onNext callbacks stay the same)
- Changing the button styling, sizing, or accessibility labels
- Modifying any other part of the filter bar

## Decisions

**Swap button position and icons only — keep callback names unchanged.**

The `onPrev` and `onNext` props still mean "go to previous day" and "go to next day" respectively. We only change which button renders first in the JSX and which chevron icon each uses. This avoids any changes to the parent component or hook logic.

Alternative considered: renaming `onPrev`/`onNext` to `onOlder`/`onNewer` — rejected as unnecessary churn for a purely visual change.

## Risks / Trade-offs

- [Mild UX surprise] Users accustomed to the current layout may briefly be disoriented → This is the intended change per user request.
