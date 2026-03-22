## ADDED Requirements

### Requirement: Favicon uses linear gradient fill
The favicon SVG (`public/favicon.svg`) SHALL use a single `<linearGradient>` element as the fill for the lightning bolt path. The gradient SHALL run diagonally from top-left to bottom-right with three color stops: `#7e14ff` at 0%, `#863bff` at 50%, and `#47bfff` at 100%.

#### Scenario: Gradient is applied to bolt path
- **WHEN** the favicon SVG is rendered
- **THEN** the lightning bolt path's `fill` attribute references the linear gradient defined in `<defs>`

#### Scenario: Gradient direction is top-left to bottom-right
- **WHEN** the gradient element is inspected
- **THEN** it SHALL have `x1="0%" y1="0%" x2="100%" y2="100%"`

### Requirement: Bolt silhouette is preserved
The lightning bolt `<path>` element's `d` attribute SHALL remain identical to the original favicon. The `viewBox`, `width`, and `height` attributes of the root `<svg>` element SHALL remain unchanged (`width="48" height="46" viewBox="0 0 48 46"`).

#### Scenario: Path geometry unchanged
- **WHEN** the bolt path's `d` attribute is compared to the original
- **THEN** it SHALL be byte-identical

#### Scenario: ViewBox dimensions unchanged
- **WHEN** the SVG root element is inspected
- **THEN** `viewBox` SHALL be `"0 0 48 46"`, `width` SHALL be `"48"`, `height` SHALL be `"46"`

### Requirement: No filter or mask elements
The favicon SVG SHALL NOT contain any `<filter>`, `<feGaussianBlur>`, `<feFlood>`, `<feBlend>`, `<mask>`, or `<g mask="...">` elements. The `<defs>` block SHALL contain only the `<linearGradient>` definition.

#### Scenario: Filters removed
- **WHEN** the SVG source is searched for filter-related elements
- **THEN** zero matches SHALL be found for `<filter`, `<feGaussianBlur`, `<feFlood`, `<feBlend`, and `<mask`

### Requirement: No background element
The favicon SVG SHALL render only the bolt shape with no background rectangle, circle, or other container shape.

#### Scenario: Standalone bolt
- **WHEN** the SVG child elements are enumerated
- **THEN** only `<defs>` and a single `<path>` element SHALL exist as direct children of `<svg>`
