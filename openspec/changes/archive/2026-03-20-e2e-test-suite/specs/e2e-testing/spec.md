## ADDED Requirements

### Requirement: Playwright config supports desktop and mobile viewports
The Playwright configuration SHALL define two projects: Desktop Chrome and Mobile Chrome (Pixel 7). Both projects SHALL run all test specs.

#### Scenario: Desktop viewport runs tests
- **WHEN** Playwright runs with the `chromium` project
- **THEN** tests execute at Desktop Chrome viewport dimensions

#### Scenario: Mobile viewport runs tests
- **WHEN** Playwright runs with the `mobile-chrome` project
- **THEN** tests execute at Pixel 7 viewport dimensions with touch support enabled

### Requirement: RSS feed requests are mocked at the network level
All E2E tests SHALL intercept `/api/rss/**` requests via `page.route()` and return XML fixture data. No test SHALL make real network requests to RSS feed endpoints.

#### Scenario: Feed request returns fixture XML
- **WHEN** the app fetches `/api/rss/digitec`
- **THEN** the mock returns the digitec XML fixture with content-type `application/xml`

#### Scenario: Unmocked feed returns empty RSS
- **WHEN** a test only mocks specific connector feeds
- **THEN** all other `/api/rss/**` requests return a valid empty RSS XML document

### Requirement: Image requests are mocked with a real pixel
All E2E tests SHALL intercept image URL requests (`**/*.jpg`) and return a 1x1 red PNG placeholder. Tests SHALL assert `naturalWidth > 0` on rendered images to verify the browser's image pipeline loaded them.

#### Scenario: Image loads as real pixel
- **WHEN** an article card renders with an `imageUrl`
- **THEN** the `<img>` element has `naturalWidth` equal to 1 (proving the mock image loaded)

### Requirement: Test state is deterministic via localStorage management
Each test SHALL start with cleared localStorage. Tests that require pre-existing state (e.g., saved articles, hidden articles, feed preferences) SHALL seed localStorage explicitly before navigation.

#### Scenario: Clean state per test
- **WHEN** a new test begins
- **THEN** localStorage is empty and no articles are hidden or saved

#### Scenario: Seeded state for read list tests
- **WHEN** a test needs articles in the read list
- **THEN** the test seeds `newsflash:readlist` in localStorage before navigating to the page

### Requirement: Navigation between pages works
The app SHALL allow switching between Feed, Read List, and Settings pages via the tab navigation. The active tab SHALL be visually indicated.

#### Scenario: App loads on feed page
- **WHEN** user navigates to the root URL
- **THEN** the Feed tab is active and article content is visible

#### Scenario: Switch to read list
- **WHEN** user clicks the Read List tab
- **THEN** the Read List page content is displayed and the Read List tab is marked as active

#### Scenario: Switch to settings
- **WHEN** user clicks the Settings tab
- **THEN** the Settings page content is displayed with Language, Appearance, and Sources sections

### Requirement: Feed page displays article cards with complete data
When articles are loaded, each article card SHALL display: title (as a link), source label, timestamp, and description. Cards with images SHALL render a visible `<img>` element.

#### Scenario: Article card shows all fields
- **WHEN** the feed page loads with mocked RSS data
- **THEN** each article card contains a title inside an `<a>` tag, a source name, a `<time>` element with a valid `dateTime` attribute, and a description paragraph

#### Scenario: Article card with image shows loaded thumbnail
- **WHEN** an article has an `imageUrl`
- **THEN** the card renders an `<img>` element with `naturalWidth > 0`

#### Scenario: Article card without image has no img element
- **WHEN** an article has no `imageUrl`
- **THEN** the card does not contain an `<img>` element

### Requirement: Search filters articles by text
The search input SHALL filter displayed articles by matching the query against article titles and descriptions.

#### Scenario: Search narrows results
- **WHEN** user types a search query matching one article's title
- **THEN** only articles matching the query are visible

#### Scenario: Search with no matches shows empty state
- **WHEN** user types a query matching no articles
- **THEN** no article cards are displayed

#### Scenario: Clearing search restores all articles
- **WHEN** user clears the search input
- **THEN** all articles for the current view are displayed again

### Requirement: All articles toggle bypasses day filtering
The "All articles" toggle button SHALL show articles from all dates when pressed, and return to day-filtered view when toggled off.

#### Scenario: Toggle all articles on
- **WHEN** user clicks the "All articles" button
- **THEN** `aria-pressed` is `"true"` and articles from all dates are displayed

#### Scenario: Toggle all articles off
- **WHEN** user clicks "All articles" again
- **THEN** `aria-pressed` is `"false"` and the day navigation reappears showing today's date

### Requirement: Day navigation moves between days
The previous/next day buttons SHALL change the selected date and filter articles to that day.

#### Scenario: Navigate to previous day
- **WHEN** user clicks the "Previous day" button
- **THEN** the day label changes and articles for the previous day are displayed

#### Scenario: Next day is disabled on today
- **WHEN** the selected date is today
- **THEN** the "Next day" button is disabled

### Requirement: Show hidden toggle reveals hidden articles
The "Hidden" toggle SHALL show previously hidden articles in a dimmed state with an unhide action.

#### Scenario: Toggle show hidden
- **WHEN** user hides an article and then clicks the "Hidden" toggle
- **THEN** the hidden article is visible in a dimmed state with an unhide button

### Requirement: Articles can be hidden via button
The hide button on article cards SHALL remove the article from the visible feed.

#### Scenario: Hide article via button
- **WHEN** user clicks the "Hide article" button on a card
- **THEN** the article disappears from the feed list

### Requirement: Articles can be saved to read list via button
The save button on article cards SHALL add the article to the read list.

#### Scenario: Save article via button
- **WHEN** user clicks the "Save to read list" button on a card
- **THEN** the article appears in the Read List page

### Requirement: Articles can be hidden via keyboard shortcut
Pressing the H key while hovering over an article card SHALL hide that article.

#### Scenario: Hide via H key
- **WHEN** user hovers over an article card and presses the H key
- **THEN** the article is hidden from the feed

### Requirement: Articles can be saved via keyboard shortcut
Pressing the S key while hovering over an article card SHALL save that article to the read list.

#### Scenario: Save via S key
- **WHEN** user hovers over an article card and presses the S key
- **THEN** the article is added to the read list

### Requirement: Articles can be hidden via swipe right on mobile
On mobile viewports, swiping right on an article card SHALL hide that article.

#### Scenario: Swipe right hides article
- **WHEN** user swipes right on an article card in mobile viewport
- **THEN** the article is hidden from the feed

### Requirement: Articles can be saved via swipe left on mobile
On mobile viewports, swiping left on an article card SHALL save that article to the read list.

#### Scenario: Swipe left saves article
- **WHEN** user swipes left on an article card in mobile viewport
- **THEN** the article is added to the read list

### Requirement: Hidden articles can be unhidden
When the "Show Hidden" toggle is active, hidden articles SHALL display an unhide action that restores them to the feed.

#### Scenario: Unhide article
- **WHEN** user clicks unhide on a hidden article
- **THEN** the article reappears in the normal feed view

### Requirement: Read list displays saved articles with remove action
The Read List page SHALL display all saved articles with a "Remove from read list" button on each card.

#### Scenario: Read list shows saved articles
- **WHEN** user navigates to the Read List page after saving articles
- **THEN** the saved articles are displayed as cards

#### Scenario: Remove from read list
- **WHEN** user clicks "Remove from read list" on a saved article
- **THEN** the article is removed from the read list

#### Scenario: Empty read list message
- **WHEN** no articles are saved
- **THEN** a message indicates no saved articles with guidance on how to save

### Requirement: Language filter restricts articles by language
The language radio group (All/DE/EN) in Settings SHALL filter feed articles by language.

#### Scenario: Filter to German only
- **WHEN** user selects "DE" in the language radio group
- **THEN** only articles from German-language connectors are displayed on the feed page

#### Scenario: Filter to English only
- **WHEN** user selects "EN" in the language radio group
- **THEN** only articles from English-language connectors are displayed on the feed page

### Requirement: Theme toggle switches between light and dark
The theme radio group in Settings SHALL switch the app between light and dark themes.

#### Scenario: Switch to dark theme
- **WHEN** user selects "Dark" in the theme radio group
- **THEN** the `<html>` element has the `dark` class

#### Scenario: Switch to light theme
- **WHEN** user selects "Light" in the theme radio group
- **THEN** the `<html>` element does not have the `dark` class

### Requirement: Source toggles enable and disable feed connectors
The source checkboxes in Settings SHALL control which connectors' articles appear in the feed.

#### Scenario: Disable a source
- **WHEN** user unchecks a connector's checkbox in Settings
- **THEN** articles from that connector no longer appear on the feed page

#### Scenario: Re-enable a source
- **WHEN** user re-checks a previously unchecked connector's checkbox
- **THEN** articles from that connector reappear on the feed page after refresh

### Requirement: Per-connector validation of card completeness
For each of the 7 connectors, when only that connector is enabled and its fixture is loaded, all article cards SHALL render with complete data including thumbnails where the fixture provides images.

#### Scenario: Digitec connector renders complete cards
- **WHEN** only the Digitec connector is enabled with its fixture (inline `<img>` and `<a><img>` wrapper images)
- **THEN** all article cards show title, source "digitec", timestamp, description, and loaded thumbnail images

#### Scenario: Galaxus connector renders complete cards
- **WHEN** only the Galaxus connector is enabled with its fixture (`<p><img></p>` and `media:thumbnail` images)
- **THEN** all article cards show title, source "galaxus", timestamp, description, and loaded thumbnail images

#### Scenario: SRF connector renders complete cards
- **WHEN** only the SRF connector is enabled with its fixture (`media:thumbnail` and `media:content[]` images)
- **THEN** all article cards show title, source "srf", timestamp, description, and loaded thumbnail images

#### Scenario: WinFuture connector renders complete cards
- **WHEN** only the WinFuture connector is enabled with its fixture (`enclosure` and inline fallback images)
- **THEN** all article cards show title, source "winfuture", timestamp, description, and loaded thumbnail images

#### Scenario: Engadget connector renders complete cards
- **WHEN** only the Engadget connector is enabled with its fixture (single and array `media:content` images)
- **THEN** all article cards show title, source "engadget", timestamp, description, and loaded thumbnail images

#### Scenario: Heise connector renders complete cards (Atom format)
- **WHEN** only the Heise connector is enabled with its Atom fixture (image in `<content>` via `<a><img>`, plain summary preserved)
- **THEN** all article cards show title, source "heise", timestamp, description, and loaded thumbnail images

#### Scenario: Ubergizmo connector renders cards with and without images
- **WHEN** only the Ubergizmo connector is enabled with its fixture (1 article with inline image, 1 without)
- **THEN** the image article has a loaded thumbnail and the no-image article has no `<img>` element, both have title, source, timestamp, and description
