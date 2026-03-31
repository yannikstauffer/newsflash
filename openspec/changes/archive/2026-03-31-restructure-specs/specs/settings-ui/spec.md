## ADDED Requirements

### Requirement: Merged settings UI spec at settings/ui.md
The file `openspec/specs/settings/ui.md` SHALL contain all requirements from:
- `settings-toggle-switches` (Switch components for feed toggles)
- `settings-bulk-toggle` (Enable All button)
- `settings-card-layout` (settings sections in cards)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `settings/ui.md` against the three source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/settings-toggle-switches/`, `openspec/specs/settings-bulk-toggle/`, and `openspec/specs/settings-card-layout/` SHALL NOT exist
