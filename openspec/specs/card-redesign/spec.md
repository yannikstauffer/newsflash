## ADDED Requirements

### Requirement: Consistent card layout with optional thumbnail
The article card SHALL use a grid layout with an optional thumbnail on the left and content on the right. When no thumbnail is present, the content SHALL span the full width. The thumbnail SHALL have rounded corners and consistent dimensions.

#### Scenario: Article with thumbnail
- **WHEN** an article has an `imageUrl`
- **THEN** the card SHALL display the thumbnail as a rounded image on the left side with the title, metadata, and description on the right

#### Scenario: Article without thumbnail
- **WHEN** an article has no `imageUrl`
- **THEN** the card content SHALL span the full width with no empty space on the left

### Requirement: Left-aligned text content
All text content within the article card (title, metadata, description) SHALL be left-aligned. No text element SHALL use center or right alignment.

#### Scenario: Text alignment in card
- **WHEN** an article card is rendered
- **THEN** the title, source/time metadata, and description text SHALL all be left-aligned within their container

### Requirement: Clear visual hierarchy in cards
The article card SHALL display elements in a clear hierarchy: metadata line (subdued, above headline), title (prominent), description (secondary). The title SHALL be visually distinct from the description through font weight and size differences. On mobile viewports (below `md`), the title SHALL use `font-medium` weight and allow up to 4 lines, and the description SHALL be hidden. On desktop viewports (`md` and above), the title SHALL use `font-semibold` weight clamped to 2 lines, and the description SHALL be visible clamped to 2 lines.

#### Scenario: Visual element ordering on desktop
- **WHEN** an article card is rendered on a viewport at `md` breakpoint or above
- **THEN** the metadata line (smaller, muted color) SHALL appear first, followed by the title (`font-semibold`, `line-clamp-2`), followed by the description (regular weight, muted color, `line-clamp-2`)

#### Scenario: Visual element ordering on mobile
- **WHEN** an article card is rendered on a viewport below the `md` breakpoint
- **THEN** the metadata line SHALL appear first, followed by the title (`font-medium`, `line-clamp-4`), and the description SHALL NOT be displayed

### Requirement: Card hover and interaction states
The article card SHALL use a borderless surface treatment with `bg-card` for background lift and a subtle resting shadow (`shadow-sm`). On hover, the shadow SHALL increase (`shadow-md`) with a smooth transition. In dark mode, shadows SHALL use higher opacity for visibility on dark backgrounds.

#### Scenario: User hovers over card
- **WHEN** a user hovers over an article card
- **THEN** the card shadow SHALL increase from `shadow-sm` to `shadow-md` with a smooth transition (no background change needed since the card surface already differentiates from the page background)

### Requirement: Metadata line position and content
The metadata line SHALL appear above the headline. It SHALL display the source name (lowercase, font-medium) and absolute timestamp, separated by a middot delimiter. On desktop viewports (md+), the category SHALL also be shown (lowercase) if present.

#### Scenario: Desktop with category
- **WHEN** an article has source "WinFuture", time 2026-03-20T14:32:05, and category "Ki" on a desktop viewport
- **THEN** the metadata line SHALL display `winfuture · 20.03.2026 14:32:05 · ki`

#### Scenario: Desktop without category
- **WHEN** an article has source "SRF" and time 2026-03-20T14:32:05 with no category on a desktop viewport
- **THEN** the metadata line SHALL display `srf · 20.03.2026 14:32:05`

#### Scenario: Mobile with category
- **WHEN** an article has source "WinFuture", time 2026-03-20T14:32:05, and category "Ki" on a mobile viewport
- **THEN** the metadata line SHALL display `winfuture · 20.03. 14:32` (category hidden)

#### Scenario: Mobile without category
- **WHEN** an article has source "SRF" and time 2026-03-20T14:32:05 on a mobile viewport
- **THEN** the metadata line SHALL display `srf · 20.03. 14:32`

### Requirement: Absolute time formatting
The time display SHALL use absolute timestamps instead of relative time. Two format functions SHALL be provided:

- **Full format** (desktop): `dd.MM.yyyy hh:mm:ss` (e.g., `20.03.2026 14:32:05`)
- **Short format** (mobile): `dd.MM. hh:mm` (e.g., `20.03. 14:32`)

#### Scenario: Full format
- **WHEN** `formatAbsoluteTime` is called with date 2026-03-20T14:32:05
- **THEN** it SHALL return `"20.03.2026 14:32:05"`

#### Scenario: Short format
- **WHEN** `formatShortTime` is called with date 2026-03-20T14:32:05
- **THEN** it SHALL return `"20.03. 14:32"`

#### Scenario: Zero-padded values
- **WHEN** either format function is called with date 2026-01-05T03:07:09
- **THEN** day, month, hours, minutes, and seconds SHALL be zero-padded (`05.01.2026 03:07:09` / `05.01. 03:07`)
