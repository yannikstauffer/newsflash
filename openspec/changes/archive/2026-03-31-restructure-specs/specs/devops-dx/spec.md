## ADDED Requirements

### Requirement: Merged DX spec at devops/dx.md
The file `openspec/specs/devops/dx.md` SHALL contain all requirements from:
- `dx-improvements` (pre-commit hook for linting)
- `project-cleanup` (dead CSS removal)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `devops/dx.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/dx-improvements/` and `openspec/specs/project-cleanup/` SHALL NOT exist
