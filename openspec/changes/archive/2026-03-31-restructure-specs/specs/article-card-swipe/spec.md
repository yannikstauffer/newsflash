## ADDED Requirements

### Requirement: Merged swipe spec at article-card/swipe.md
The file `openspec/specs/article-card/swipe.md` SHALL contain all requirements from:
- `swipe-gesture-detection` (asymmetric drag thresholds)
- `swipe-reveal-background` (colored background with action icon)
- `card-removal-animation` (slide-away animation on removal)

All original requirement text SHALL be preserved verbatim. Section headers SHALL group by gesture detection, visual feedback, and animation.

#### Scenario: All source requirements present
- **WHEN** comparing `article-card/swipe.md` against the three source specs
- **THEN** every requirement from each source spec SHALL appear in the merged file

#### Scenario: Source specs deleted
- **WHEN** the migration is complete
- **THEN** the directories `openspec/specs/swipe-gesture-detection/`, `openspec/specs/swipe-reveal-background/`, and `openspec/specs/card-removal-animation/` SHALL NOT exist
