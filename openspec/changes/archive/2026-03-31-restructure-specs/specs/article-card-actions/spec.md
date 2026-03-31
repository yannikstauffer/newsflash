## ADDED Requirements

### Requirement: Merged article actions spec at article-card/actions.md
The file `openspec/specs/article-card/actions.md` SHALL contain all requirements from:
- `article-actions` (article ID prefixes and action handling)
- `bulk-article-actions` (Hide All button in filter bar)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `article-card/actions.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/article-actions/` and `openspec/specs/bulk-article-actions/` SHALL NOT exist
