## ADDED Requirements

### Requirement: Merged CI/CD spec at devops/ci-cd.md
The file `openspec/specs/devops/ci-cd.md` SHALL contain all requirements from:
- `ci-cd-pipeline` (CI workflow on pull requests)
- `release-artifacts` (production build attached to releases)
- `release-automation` (release-please creates Release PRs)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `devops/ci-cd.md` against the three source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/ci-cd-pipeline/`, `openspec/specs/release-artifacts/`, and `openspec/specs/release-automation/` SHALL NOT exist
