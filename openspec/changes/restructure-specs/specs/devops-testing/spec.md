## ADDED Requirements

### Requirement: Merged testing infrastructure spec at devops/testing.md
The file `openspec/specs/devops/testing.md` SHALL contain all requirements from:
- `e2e-testing` (Playwright config for desktop and mobile viewports)
- `test-coverage-config` (Vitest coverage provider configuration)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `devops/testing.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/e2e-testing/` and `openspec/specs/test-coverage-config/` SHALL NOT exist
