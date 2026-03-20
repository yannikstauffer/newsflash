## MODIFIED Requirements

### Requirement: Clear visual hierarchy in cards
The article card SHALL display elements in a clear hierarchy: metadata line (subdued, above headline), title (prominent), description (secondary). The title SHALL be visually distinct from the description through font weight and size differences.

#### Scenario: Visual element ordering
- **WHEN** an article card is rendered
- **THEN** the metadata line (smaller, muted color) SHALL appear first, followed by the title (semibold, larger text), followed by the description (regular weight, muted color, max 2 lines)

### Requirement: Metadata display with source favicon or dot
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

## ADDED Requirements

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
