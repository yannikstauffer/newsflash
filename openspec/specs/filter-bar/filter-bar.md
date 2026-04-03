# Filter Bar Refinement

## Requirements

### Requirement: Simplified single-row filter bar
The filter bar SHALL use a two-row layout. Row 1 SHALL contain the article counter (left-aligned), the "All articles" toggle, "Show hidden" toggle, and search input. Row 2 SHALL contain the centered day navigation (`< date >`), visible only when "All articles" is not active. The refresh status SHALL NOT appear in the filter bar — it SHALL be rendered outside the filter bar in the parent page. Source pills and language selector SHALL NOT appear on the feed page.

#### Scenario: Filter bar rendering
- **WHEN** the filter bar is displayed with day navigation visible
- **THEN** row 1 SHALL show article counter on the left, followed by toggle buttons and search
- **AND** row 2 SHALL show the date navigator centered, with the "Previous day" button (left chevron) on the left and the "Next day" button (right chevron) on the right

#### Scenario: Toggle ordering
- **WHEN** the filter bar is displayed
- **THEN** the "All articles" toggle SHALL appear to the left of the "Hidden" toggle

#### Scenario: Day navigation centering
- **WHEN** the filter bar is displayed and "All articles" is not active
- **THEN** the prev/date/next controls SHALL be visually centered within row 2

#### Scenario: Day navigation hidden when all articles active
- **WHEN** "All articles" toggle is active
- **THEN** row 2 SHALL NOT be displayed

#### Scenario: Next day button disabled when on today
- **WHEN** the selected date is today
- **THEN** the "Next day" button SHALL be disabled

#### Scenario: Mobile view
- **WHEN** the filter bar is displayed on a mobile viewport
- **THEN** row 1 SHALL show article counter, icon-only toggle buttons, and a search icon button
- **AND** row 2 SHALL show centered day navigation (when visible)

### Requirement: Search input with clear affordance
The search input SHALL include a visible search icon on the left, a clear button (x) when text is present or input has focus, and expand to fill available horizontal space on desktop.

#### Scenario: Search input display
- **WHEN** the filter bar is rendered on desktop
- **THEN** the search input SHALL display with a search icon prefix, clear button, and fill remaining space

#### Scenario: Search input on mobile
- **WHEN** the filter bar is rendered on mobile
- **THEN** the search SHALL be represented by an icon button that expands on tap

### Requirement: Search icon button matches toggle button styling
The mobile search icon button SHALL use the same visual styling as the "All articles" and "Hidden" toggle buttons: `outline` variant with `rounded-full` border radius. It SHALL NOT use the `ghost` variant.

#### Scenario: Search icon button visual consistency
- **WHEN** the filter bar is rendered on mobile
- **THEN** the search icon button SHALL have a visible border and pill shape matching the toggle buttons

### Requirement: Icon centering in mobile toggle buttons
Toggle button icons SHALL be horizontally centered within the button on mobile viewports where the text label is hidden. Padding SHALL be symmetric when the button is in icon-only mode.

#### Scenario: Toggle button icon alignment on mobile
- **WHEN** toggle buttons are displayed on a mobile viewport with hidden text labels
- **THEN** the icon SHALL be visually centered horizontally within the button

### Requirement: Refresh timestamp wording
The refresh timestamp SHALL display "Refreshed just now" (not "Refreshed now") when the last refresh occurred less than 60 seconds ago.

#### Scenario: Recent refresh display
- **WHEN** the last refresh occurred less than 60 seconds ago
- **THEN** the displayed text SHALL be "Refreshed just now"

---

# Filter Bar Responsive Layout

## Requirements

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
The search input SHALL display a clear button (x) when the input has focus or contains text.

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

---

# Sticky Filter Bar

## Requirements

### Requirement: Sticky filter bar positioning
The filter bar SHALL be pinned to the top of the viewport using `position: sticky` with `top: 0` so it remains visible while the user scrolls through articles. The filter bar SHALL have a background color matching the page background and a `z-index` sufficient to layer above scrolling content. A subtle bottom border SHALL visually separate the sticky bar from scrolling content below.

#### Scenario: Filter bar stays visible on scroll
- **WHEN** the user scrolls down through the article list
- **THEN** the filter bar (controls row and day navigation) SHALL remain pinned at the top of the viewport

#### Scenario: Content does not bleed through sticky bar
- **WHEN** article cards scroll behind the sticky filter bar
- **THEN** the filter bar SHALL have an opaque background that fully obscures content beneath it

#### Scenario: Visual separator between sticky bar and content
- **WHEN** the filter bar is in its sticky position
- **THEN** a subtle bottom border SHALL be visible to separate the bar from scrolling content

### Requirement: Refresh timestamp outside sticky bar
The "Refreshed just now" status text SHALL be rendered outside the sticky filter bar, in the feed page content area between the filter bar and the article list. It SHALL scroll away with the article content.

#### Scenario: Refresh text scrolls with content
- **WHEN** the user scrolls down through articles
- **THEN** the "Refreshed just now" text SHALL scroll away with the content, not remain pinned

#### Scenario: Refresh text positioned between filter bar and articles
- **WHEN** the feed page is rendered
- **THEN** the refresh timestamp SHALL appear below the sticky filter bar and above the first article card, centered horizontally

### Requirement: Article counter in sticky bar
The article counter (e.g., "27 articles") SHALL remain in the filter bar's controls row (Row 1) so it is always visible while scrolling.

#### Scenario: Article counter visible while scrolling
- **WHEN** the user scrolls through articles
- **THEN** the article counter SHALL remain visible in the sticky filter bar
