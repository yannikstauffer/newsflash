# Article Card Layout

## From: card-redesign/spec.md

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

## From: card-description-clamp/spec.md

## Requirements

### Requirement: Fixed-height title+description container on desktop

On `md:` breakpoint and above, the title and description SHALL be wrapped in a flex-column container with a fixed height of `92px`. The title SHALL be `flex-none` (taking its natural height). The description SHALL be `flex-1` with `overflow-hidden`.

#### Scenario: Two-line title with description

- **WHEN** an article card is rendered on desktop with a title that wraps to 2 lines
- **THEN** the description SHALL be visible for approximately 2 lines (40px available: 92px - 48px title - 4px gap)

#### Scenario: One-line title with description

- **WHEN** an article card is rendered on desktop with a title that fits on 1 line
- **THEN** the description SHALL be visible for approximately 3 lines (64px available: 92px - 24px title - 4px gap), with any partial overflow masked by the gradient fade

#### Scenario: No description

- **WHEN** an article card is rendered on desktop with no description text
- **THEN** the fixed-height container SHALL still apply, with the title taking its natural height and remaining space empty

#### Scenario: Cards without images

- **WHEN** an article card without an image is rendered on desktop
- **THEN** the same fixed-height title+description container and gradient fade behavior SHALL apply

### Requirement: Gradient fade on description overflow

The description paragraph SHALL use a CSS `mask-image` to create a gradient fade at the bottom, smoothly dissolving any partially visible lines instead of a hard cutoff.

#### Scenario: Description overflows available space

- **WHEN** the description text exceeds the available height in the flex container
- **THEN** the bottom ~12px (`0.75rem`) of the description area SHALL fade from fully visible to transparent via `mask-image: linear-gradient(to bottom, black calc(100% - 0.75rem), transparent)`

#### Scenario: Description fits within available space

- **WHEN** the description text fits entirely within the available height
- **THEN** the gradient fade SHALL still be present but have no visible effect (all text is above the fade zone)

### Requirement: Title clamping unchanged

The title SHALL retain its existing `md:line-clamp-2` behavior on desktop and `line-clamp-4` on mobile. This change does not modify title truncation.

### Requirement: Mobile layout unchanged

On viewports below `md:` breakpoint, the card SHALL retain its current layout: title with `line-clamp-4`, description hidden. The fixed-height container and gradient fade SHALL NOT apply on mobile.

## Height Calculation Reference

```
text-base (title):  16px font, 24px line-height
text-sm (desc):     14px font, 20px line-height
mb-1 (gap):         4px

Container height = 92px

2-line title: 48px + 4px gap = 52px used → 40px for desc = 2.0 lines
1-line title: 24px + 4px gap = 28px used → 64px for desc = 3.2 lines (gradient fades partial)
```

## From: mobile-card-layout/spec.md

## Requirements

### Requirement: Mobile title line clamp relaxed to 4 lines
On viewports below the `md` breakpoint, the article card title SHALL be clamped to a maximum of 4 lines (`line-clamp-4`). On `md` and above, the title SHALL remain clamped to 2 lines (`line-clamp-2`).

#### Scenario: Title with 3 lines of text on mobile
- **WHEN** an article title wraps to 3 lines on a mobile viewport
- **THEN** the full title text SHALL be visible without truncation

#### Scenario: Title with 5 lines of text on mobile
- **WHEN** an article title would wrap to 5 lines on a mobile viewport
- **THEN** the title SHALL be clamped at 4 lines with ellipsis

#### Scenario: Title on desktop viewport
- **WHEN** an article title is displayed on a viewport at `md` breakpoint or above
- **THEN** the title SHALL be clamped to 2 lines with ellipsis (unchanged behavior)

### Requirement: Mobile title uses medium font weight
On viewports below the `md` breakpoint, the article card title SHALL use `font-medium` (weight 500). On `md` and above, the title SHALL use `font-semibold` (weight 600).

#### Scenario: Title weight on mobile
- **WHEN** an article card is rendered on a mobile viewport
- **THEN** the title SHALL have font-weight 500 (`font-medium`)

#### Scenario: Title weight on desktop
- **WHEN** an article card is rendered on a viewport at `md` breakpoint or above
- **THEN** the title SHALL have font-weight 600 (`font-semibold`)

### Requirement: Description hidden on mobile
The article description paragraph SHALL NOT be rendered on viewports below the `md` breakpoint. On `md` and above, the description SHALL be displayed with `line-clamp-2` (unchanged).

#### Scenario: Article with description on mobile
- **WHEN** an article has a description and is viewed on a mobile viewport
- **THEN** the description paragraph SHALL be hidden

#### Scenario: Article with description on desktop
- **WHEN** an article has a description and is viewed on a viewport at `md` breakpoint or above
- **THEN** the description SHALL be visible, clamped to 2 lines

### Requirement: Uniform 96x96 square thumbnail
The article card thumbnail SHALL be 96x96 pixels (`size-24`) on all viewports. The HTML `width` and `height` attributes SHALL both be set to `96`.

#### Scenario: Thumbnail on mobile
- **WHEN** an article with an image is rendered on a mobile viewport
- **THEN** the thumbnail SHALL display at 96x96 pixels

#### Scenario: Thumbnail on desktop
- **WHEN** an article with an image is rendered on a desktop viewport
- **THEN** the thumbnail SHALL display at 96x96 pixels
