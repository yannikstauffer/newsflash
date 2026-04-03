## ADDED Requirements

### Requirement: Merged UI polish spec at ui/polish.md
The file `openspec/specs/ui/polish.md` SHALL contain all requirements from:
- `ui-polish` (consistent vertical spacing)
- `favicon-gradient` (favicon linear gradient fill)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `ui/polish.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/ui-polish/` and `openspec/specs/favicon-gradient/` SHALL NOT exist
