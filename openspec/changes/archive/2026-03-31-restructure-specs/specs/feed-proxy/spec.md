## ADDED Requirements

### Requirement: Merged proxy spec at feed/proxy.md
The file `openspec/specs/feed/proxy.md` SHALL contain all requirements from:
- `feed-proxy` (Vite dev proxy)
- `feed-proxy-production` (Vercel Edge Function proxy)

All original requirement text SHALL be preserved verbatim. Section headers SHALL group by environment (development vs production).

#### Scenario: All source requirements present
- **WHEN** comparing `feed/proxy.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/feed-proxy/` and `openspec/specs/feed-proxy-production/` SHALL NOT exist
