## ADDED Requirements

### Requirement: Merged connector spec at feed/connectors.md
The file `openspec/specs/feed/connectors.md` SHALL contain all requirements from the following source specs, combined under section headers by sub-concern:
- `feed-connectors` (connector interface contract)
- `connector-folder-structure` (source file layout)
- `connector-article-filters` (per-connector filter definitions)
- `e2e-test-maintenance` (connector e2e testing strategy)

All original requirement text SHALL be preserved verbatim. Section headers SHALL group requirements by sub-concern.

#### Scenario: All source requirements present
- **WHEN** comparing `feed/connectors.md` against the four source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/feed-connectors/`, `openspec/specs/connector-folder-structure/`, `openspec/specs/connector-article-filters/`, and `openspec/specs/e2e-test-maintenance/` SHALL NOT exist
