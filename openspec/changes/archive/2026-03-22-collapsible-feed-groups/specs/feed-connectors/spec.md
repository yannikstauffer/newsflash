## MODIFIED Requirements

### Requirement: SRF connector supports multiple sub-feeds
The SRF connector SHALL declare all 26 available SRF feeds in its `feeds` array, organized into 4 groups: News (5 feeds), Sport (8 feeds), Kultur (7 feeds), and Wissen (6 feeds). Each feed SHALL have a unique sub-ID, display name, and group assignment.

#### Scenario: SRF exposes all topic-level feeds
- **WHEN** the SRF connector is loaded
- **THEN** its `feeds` array SHALL contain 26 entries covering News, Sport, Kultur, and Wissen categories

#### Scenario: SRF feeds have group assignments
- **WHEN** the SRF connector is loaded
- **THEN** every feed in its `feeds` array SHALL have a `group` property set to one of "News", "Sport", "Kultur", or "Wissen"

#### Scenario: SRF News group
- **WHEN** the SRF connector feeds are filtered by group "News"
- **THEN** the result SHALL include feeds for: Das Neueste, Schweiz, International, Wirtschaft, News

#### Scenario: SRF Sport group
- **WHEN** the SRF connector feeds are filtered by group "Sport"
- **THEN** the result SHALL include feeds for: Sport, Fussball, Eishockey, Tennis, Ski Alpin, Leichtathletik, Motorsport, Mehr Sport

#### Scenario: SRF Kultur group
- **WHEN** the SRF connector feeds are filtered by group "Kultur"
- **THEN** the result SHALL include feeds for: Kultur, Film & Serien, Gesellschaft & Religion, Literatur, Musik, Kunst, Buehne

#### Scenario: SRF Wissen group
- **WHEN** the SRF connector feeds are filtered by group "Wissen"
- **THEN** the result SHALL include feeds for: Wissen, Gesundheit, Nachhaltigkeit, Mensch, Natur & Tiere, Technik

## ADDED Requirements

### Requirement: Feed URLs include all 26 SRF feeds
The feed URL registry SHALL include URL mappings for all 26 SRF feed IDs, using the RSS feed URLs from srf.ch.

#### Scenario: All SRF feed IDs have URLs
- **WHEN** the feed URL registry is loaded
- **THEN** it SHALL contain valid HTTPS URLs for all 26 SRF feed IDs

#### Scenario: New SRF feed URLs are correct
- **WHEN** a new SRF feed URL is looked up (e.g., "srf-ice-hockey")
- **THEN** it SHALL return the corresponding srf.ch RSS feed URL (e.g., `https://www.srf.ch/sport/bnf/rss/3418`)
