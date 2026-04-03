## ADDED Requirements

### Requirement: Merged locale spec at settings/locale.md
The file `openspec/specs/settings/locale.md` SHALL contain all requirements from:
- `app-locale-setting` (language selector on settings page)
- `i18n-infrastructure` (i18next initialization and locale detection)

All original requirement text SHALL be preserved verbatim.

#### Scenario: All source requirements present
- **WHEN** comparing `settings/locale.md` against both source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/app-locale-setting/` and `openspec/specs/i18n-infrastructure/` SHALL NOT exist
