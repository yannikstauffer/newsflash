## ADDED Requirements

### Requirement: Merged card layout spec at article-card/layout.md
The file `openspec/specs/article-card/layout.md` SHALL contain all requirements from:
- `card-redesign` (consistent card layout with thumbnails)
- `card-description-clamp` (fixed-height title/description container)
- `mobile-card-layout` (mobile title line clamp)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `article-card/layout.md` against the three source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/card-redesign/`, `openspec/specs/card-description-clamp/`, and `openspec/specs/mobile-card-layout/` SHALL NOT exist
