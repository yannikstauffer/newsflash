## ADDED Requirements

### Requirement: SRF connector defines category filters based on URL path
The SRF connector SHALL define three `ArticleFilter` entries that match articles by their link URL path prefix. Each filter SHALL have `enabledByDefault: true` so that all SRF content is shown by default.

#### Scenario: Sport filter matches sport article
- **WHEN** an article has link containing `/sport/` (e.g., `https://www.srf.ch/sport/eishockey/...`)
- **THEN** the `srf-filter-sport` filter's `match` function SHALL return `true`

#### Scenario: Sport filter does not match news article
- **WHEN** an article has link containing `/news/` (e.g., `https://www.srf.ch/news/schweiz/...`)
- **THEN** the `srf-filter-sport` filter's `match` function SHALL return `false`

#### Scenario: Kultur filter matches culture article
- **WHEN** an article has link containing `/kultur/` (e.g., `https://www.srf.ch/kultur/musik/...`)
- **THEN** the `srf-filter-kultur` filter's `match` function SHALL return `true`

#### Scenario: Wissen filter matches knowledge article
- **WHEN** an article has link containing a Wissen-category path
- **THEN** the `srf-filter-wissen` filter's `match` function SHALL return `true`

### Requirement: Disabling SRF category filter hides matching articles from all feeds
When a user disables an SRF category filter, articles matching that category SHALL be excluded from the feed regardless of which SRF feed delivered them (including `srf-latest`).

#### Scenario: Disabling sport filter hides sport articles from srf-latest
- **WHEN** the user disables the `srf-filter-sport` filter
- **AND** a sport article arrived via the `srf-latest` feed
- **THEN** that article SHALL be excluded from the displayed feed

#### Scenario: Disabling sport filter does not affect non-sport articles
- **WHEN** the user disables the `srf-filter-sport` filter
- **AND** an article has link containing `/news/`
- **THEN** that article SHALL still be displayed

### Requirement: SRF category filters use srf-filter- prefix for IDs
Each SRF category filter ID SHALL use the prefix `srf-filter-` to avoid collision with SRF feed IDs (e.g., `srf-sport`). The filter IDs SHALL be: `srf-filter-sport`, `srf-filter-kultur`, `srf-filter-wissen`.

#### Scenario: Filter IDs do not collide with feed IDs
- **WHEN** the SRF connector defines filter with ID `srf-filter-sport`
- **THEN** it SHALL NOT collide with the feed ID `srf-sport`
