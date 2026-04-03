## ADDED Requirements

### Requirement: Merged storage spec at sync/storage.md
The file `openspec/specs/sync/storage.md` SHALL contain all requirements from:
- `storage-pruning` (bounded hidden IDs list)
- `theme-persistence` (theme preference three modes)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `sync/storage.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/storage-pruning/` and `openspec/specs/theme-persistence/` SHALL NOT exist
