## ADDED Requirements

### Requirement: Lazy list preserves visible count when items grow or stay the same size
The `useLazyList` hook SHALL preserve the current `visibleCount` when the items array reference changes but the new array length is greater than or equal to the previous length. The hook SHALL only reset `visibleCount` to `batchSize` when the new array is shorter than the previous one.

#### Scenario: Background refresh with same number of articles
- **WHEN** the items array reference changes but the new array has the same length as the previous one
- **THEN** `visibleCount` SHALL remain at its current value
- **AND** all previously visible items SHALL remain visible without interruption

#### Scenario: Background refresh adds new articles
- **WHEN** the items array reference changes and the new array is longer than the previous one
- **THEN** `visibleCount` SHALL remain at its current value (clamped to the new array length if needed)
- **AND** newly added articles beyond the visible window SHALL become visible through normal scroll-based loading

#### Scenario: Filter change reduces the list
- **WHEN** the items array reference changes and the new array is shorter than the previous one
- **THEN** `visibleCount` SHALL reset to `batchSize`
- **AND** the visible window SHALL start from the beginning of the new list

#### Scenario: Items change from empty to populated
- **WHEN** the items array transitions from length 0 to a non-empty array
- **THEN** `visibleCount` SHALL be set to `batchSize` (initial load behavior preserved)

#### Scenario: Visible count exceeds new array length
- **WHEN** `visibleCount` is 40 and the new items array has 35 items (still >= previous length)
- **THEN** `visibleCount` SHALL be clamped to the new array length (35)
- **AND** no blank space or missing items SHALL appear
