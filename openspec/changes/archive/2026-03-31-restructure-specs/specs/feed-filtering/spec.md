## ADDED Requirements

### Requirement: Merged filtering spec at feed/filtering.md
The file `openspec/specs/feed/filtering.md` SHALL contain all requirements from the following source specs, combined under section headers by sub-concern:
- `feed-filtering` (filter logic and AND combination)
- `feed-configuration` (filter toggles in settings UI)
- `feed-page-orchestration` (useFeedPage hook encapsulation)
- `feed-page-hook-tests` (useFeedPage filtering test requirements)
- `hook-unit-tests` (useFeedData deduplication test requirements)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `feed/filtering.md` against the five source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/feed-filtering/`, `openspec/specs/feed-configuration/`, `openspec/specs/feed-page-orchestration/`, `openspec/specs/feed-page-hook-tests/`, and `openspec/specs/hook-unit-tests/` SHALL NOT exist
