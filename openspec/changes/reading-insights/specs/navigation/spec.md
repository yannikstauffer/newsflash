## ADDED Requirements

### Requirement: Overflow navigation button replaces Settings nav item
The bottom navigation bar SHALL replace the Settings navigation item with a `MoreVertical` icon button that opens an overflow navigation sheet. Settings SHALL no longer appear as a direct nav item.

#### Scenario: Settings item is absent from the nav bar
- **WHEN** the navigation bar is rendered
- **THEN** there SHALL be no nav item linking directly to `/settings`

#### Scenario: MoreVertical button is present in the nav bar
- **WHEN** the navigation bar is rendered
- **THEN** a button with a `MoreVertical` icon SHALL be present as the rightmost nav item, with a minimum touch target of 48px

### Requirement: Overflow sheet lists Settings and Insights destinations
Tapping the overflow button SHALL open a bottom sheet (mobile) or anchored popover (desktop) listing two navigation destinations: Insights (`/insights`) and Settings (`/settings`).

#### Scenario: Overflow sheet opens on button tap
- **WHEN** the user taps the overflow button
- **THEN** the overflow sheet SHALL become visible, listing Insights and Settings as navigation items

#### Scenario: Tapping a sheet item navigates and closes the sheet
- **WHEN** the user taps "Insights" in the overflow sheet
- **THEN** the application SHALL navigate to `/insights` and the sheet SHALL close

#### Scenario: Tapping the backdrop closes the sheet
- **WHEN** the overflow sheet is open and the user taps outside it
- **THEN** the sheet SHALL close without navigating

#### Scenario: Overflow sheet is keyboard accessible
- **WHEN** the overflow button receives focus and the user activates it via keyboard
- **THEN** the sheet SHALL open and focus SHALL move to the first item in the sheet

### Requirement: Sync status indicator is shown on the overflow button
The overflow button SHALL display a visual indicator reflecting the current sync status, consistent with the former behaviour on the Settings nav icon: no indicator when IDLE, animated indicator when SYNCING, success indicator when SUCCESS, error indicator when ERROR.

#### Scenario: Idle state shows no indicator on overflow button
- **WHEN** the sync status is IDLE
- **THEN** the overflow button SHALL show only the MoreVertical icon with no additional indicator

#### Scenario: Syncing state shows animated indicator on overflow button
- **WHEN** the sync status is SYNCING
- **THEN** the overflow button SHALL show a visual animated indicator alongside or overlaying the MoreVertical icon

#### Scenario: Success state shows success indicator on overflow button
- **WHEN** the sync status is SUCCESS
- **THEN** the overflow button SHALL show a success indicator on the overflow button

### Requirement: Insights page route is registered
The application SHALL register `/insights` as a valid route that renders the InsightsPage component, lazy-loaded.

#### Scenario: Insights page renders at /insights
- **WHEN** the user navigates to `/insights`
- **THEN** the InsightsPage component SHALL be rendered

#### Scenario: InsightsPage is lazy-loaded
- **WHEN** the application starts and the user is on the `/` route
- **THEN** the InsightsPage component module SHALL NOT be included in the initial bundle and SHALL be loaded only when the user navigates to `/insights`

#### Scenario: Insights navigation item shows active state
- **WHEN** the user is on the `/insights` route and opens the overflow sheet
- **THEN** the Insights item in the sheet SHALL display with the active style and `aria-current="page"`
