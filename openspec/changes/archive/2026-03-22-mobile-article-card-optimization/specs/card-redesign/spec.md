## MODIFIED Requirements

### Requirement: Clear visual hierarchy in cards
The article card SHALL display elements in a clear hierarchy: metadata line (subdued, above headline), title (prominent), description (secondary). The title SHALL be visually distinct from the description through font weight and size differences. On mobile viewports (below `md`), the title SHALL use `font-medium` weight and allow up to 4 lines, and the description SHALL be hidden. On desktop viewports (`md` and above), the title SHALL use `font-semibold` weight clamped to 2 lines, and the description SHALL be visible clamped to 2 lines.

#### Scenario: Visual element ordering on desktop
- **WHEN** an article card is rendered on a viewport at `md` breakpoint or above
- **THEN** the metadata line (smaller, muted color) SHALL appear first, followed by the title (`font-semibold`, `line-clamp-2`), followed by the description (regular weight, muted color, `line-clamp-2`)

#### Scenario: Visual element ordering on mobile
- **WHEN** an article card is rendered on a viewport below the `md` breakpoint
- **THEN** the metadata line SHALL appear first, followed by the title (`font-medium`, `line-clamp-4`), and the description SHALL NOT be displayed
