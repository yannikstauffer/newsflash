## ADDED Requirements

### Requirement: Merged card content spec at article-card/content.md
The file `openspec/specs/article-card/content.md` SHALL contain all requirements from:
- `inline-image-extraction` (extract leading image from description)
- `html-sanitization` (strip HTML from descriptions)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `article-card/content.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/inline-image-extraction/` and `openspec/specs/html-sanitization/` SHALL NOT exist
