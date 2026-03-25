## ADDED Requirements

### Requirement: Refresh status is left-aligned
The "Refreshed X ago" text SHALL be rendered as a standalone element on the left side of the filter bar row.

#### Scenario: Refresh status visible
- **WHEN** `lastRefreshedAt` is not null
- **THEN** the refresh text is displayed left-aligned in the filter bar row

#### Scenario: Refresh status absent
- **WHEN** `lastRefreshedAt` is null
- **THEN** no refresh text is rendered, and the right cluster remains right-aligned

### Requirement: Article count and filters form a right-aligned cluster
The article count text and all filter toggle buttons SHALL be grouped together and right-aligned within the filter bar row using `ml-auto`.

#### Scenario: Right cluster alignment on mobile
- **WHEN** the viewport is below the `md` breakpoint
- **THEN** the article count, toggle buttons, and mobile search icon are pushed to the right edge of the row

#### Scenario: Right cluster alignment on desktop
- **WHEN** the viewport is at or above the `md` breakpoint
- **THEN** the article count and toggle buttons are pushed to the right, followed by the desktop search input

### Requirement: Responsive spacing between article count and filters
The gap between the article count text and the first filter button SHALL be `gap-1.5` (6px) on mobile and `md:gap-3` (12px) on desktop.

#### Scenario: Mobile spacing
- **WHEN** the viewport is below the `md` breakpoint
- **THEN** the spacing between article count and the first toggle button is 6px

#### Scenario: Desktop spacing
- **WHEN** the viewport is at or above the `md` breakpoint
- **THEN** the spacing between article count and the first toggle button is 12px
