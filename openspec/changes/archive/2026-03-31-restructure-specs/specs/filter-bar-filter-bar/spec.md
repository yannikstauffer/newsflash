## ADDED Requirements

### Requirement: Merged filter bar spec at filter-bar/filter-bar.md
The file `openspec/specs/filter-bar/filter-bar.md` SHALL contain all requirements from:
- `filter-bar-refinement` (simplified single-row bar)
- `filter-bar-responsive-layout` (icon-only toggle buttons on mobile)
- `sticky-filter-bar` (sticky positioning)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `filter-bar/filter-bar.md` against the three source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/filter-bar-refinement/`, `openspec/specs/filter-bar-responsive-layout/`, and `openspec/specs/sticky-filter-bar/` SHALL NOT exist
