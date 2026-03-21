## ADDED Requirements

### Requirement: Icon-only toggle buttons on mobile
The "All articles" and "Hidden" toggle buttons SHALL render as icon-only buttons on viewports below the `md` breakpoint (< 768px). The "All articles" button SHALL use the `List` icon. The "Hidden" button SHALL use the `Eye` icon (when active) or `EyeOff` icon (when inactive). On `md` and above, buttons SHALL display both icon and text label.

#### Scenario: Mobile renders icon-only
- **WHEN** the filter bar is displayed on a viewport below `md` breakpoint
- **THEN** the "All articles" button SHALL show only the `List` icon without text
- **AND** the "Hidden" button SHALL show only the `Eye`/`EyeOff` icon without text

#### Scenario: Desktop renders icon and text
- **WHEN** the filter bar is displayed on a viewport at or above `md` breakpoint
- **THEN** the "All articles" button SHALL show the `List` icon followed by "All articles" text
- **AND** the "Hidden" button SHALL show the `Eye`/`EyeOff` icon followed by "Hidden" text

#### Scenario: Icon-only buttons have accessible labels
- **WHEN** the buttons render as icon-only on mobile
- **THEN** each button SHALL have an `aria-label` attribute ("All articles", "Hidden") for screen readers

### Requirement: Collapsible search on mobile
On viewports below the `md` breakpoint, the search input SHALL be collapsed into a search icon button. Tapping the icon button SHALL expand the search input to full width, hiding other row-1 controls (status text and toggle buttons). On `md` and above, the search input SHALL always be visible.

#### Scenario: Search collapsed by default on mobile
- **WHEN** the filter bar is displayed on mobile with no active search
- **THEN** a search icon button SHALL be displayed instead of the search input

#### Scenario: Tapping search icon expands input
- **WHEN** the user taps the search icon button on mobile
- **THEN** the search input SHALL expand to full width of row 1
- **AND** the status text and toggle buttons SHALL be hidden
- **AND** the search input SHALL receive focus automatically

#### Scenario: Active search indicator on collapsed icon
- **WHEN** the search has active text and the search bar is collapsed on mobile
- **THEN** the search icon button SHALL display a visual indicator (accent color or dot) to signal an active filter

#### Scenario: Desktop search always visible
- **WHEN** the filter bar is displayed on a viewport at or above `md` breakpoint
- **THEN** the search input SHALL always be visible regardless of `searchOpen` state

### Requirement: Clear button in search input
The search input SHALL display a clear button (✕) when the input has focus or contains text.

#### Scenario: Clear button clears text
- **WHEN** the search input contains text and the user clicks the clear button
- **THEN** the search text SHALL be cleared

#### Scenario: Clear button collapses search on mobile when empty
- **WHEN** the search input is empty on mobile and the user clicks the clear button
- **THEN** the search bar SHALL collapse back to the icon button

#### Scenario: Escape key collapses search on mobile
- **WHEN** the search input is open on mobile and the user presses Escape
- **THEN** the search bar SHALL collapse back to the icon button

### Requirement: Two-row filter bar layout
The filter bar SHALL use a two-row layout. Row 1 SHALL contain the status text (left), toggle buttons, and search. Row 2 SHALL contain the centered day navigation. Row 2 SHALL only be visible when "All articles" mode is not active.

#### Scenario: Two-row layout rendering
- **WHEN** the filter bar is displayed with "All articles" not active
- **THEN** row 1 SHALL contain status, toggles, and search
- **AND** row 2 SHALL contain the day navigation centered horizontally

#### Scenario: Single-row when all articles active
- **WHEN** "All articles" toggle is active
- **THEN** only row 1 SHALL be visible
- **AND** row 2 (day navigation) SHALL NOT be rendered

### Requirement: Status and article count on the left
The refresh status text and article count SHALL be displayed on the left side of row 1, before the toggle buttons.

#### Scenario: Status text positioning
- **WHEN** the filter bar is displayed and `lastRefreshedAt` is available
- **THEN** the refresh status text SHALL appear at the left edge of row 1

#### Scenario: Article count display
- **WHEN** the filter bar is displayed
- **THEN** the count of non-hidden articles matching current filters SHALL be displayed next to the refresh status

#### Scenario: Article count with hidden annotation
- **WHEN** "show hidden" is active and there are hidden articles
- **THEN** the count SHALL display as "{visible} + {hidden} hidden" (e.g., "14 + 3 hidden")

#### Scenario: Article count without hidden annotation
- **WHEN** "show hidden" is not active
- **THEN** the count SHALL display as "{count} articles" (e.g., "14 articles")
