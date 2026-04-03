## Context

The `openspec/specs/` directory currently contains 51 flat spec directories, each with a single `spec.md` file. There is no grouping by domain, and granularity varies wildly — from single CSS properties to full architectural features. Related specs are split across multiple directories.

This change reorganizes them into 27 spec files under 9 domain folders while preserving all requirement content.

## Goals / Non-Goals

**Goals:**
- Group specs by domain for navigability (9 folders)
- Merge related micro-specs into cohesive feature specs (51 → 27)
- Dissolve test-only specs into their parent feature specs
- Preserve all existing requirement text verbatim

**Non-Goals:**
- Rewriting or improving requirement text
- Changing application code
- Modifying the openspec config or archived changes
- Adding new requirements

## Decisions

### 1. Folder-based grouping over flat naming convention

Group specs into domain subdirectories (`feed/`, `article-card/`, etc.) rather than using name prefixes (`feed--connectors.md`).

**Rationale:** Folders provide IDE tree navigation, allow per-domain README files in the future, and scale better as specs grow. Prefix conventions are fragile and less discoverable.

### 2. Merge strategy: concatenate with section headers

When merging multiple source specs into one target spec, combine requirements under section headers that group by sub-concern. Keep all original requirement text — don't rewrite, summarize, or deduplicate.

**Rationale:** Preserving verbatim text avoids accidentally losing detail or changing intent. Section headers within a merged spec maintain the logical separation that the original split provided.

### 3. Test-only specs become requirements in parent specs

Specs like `hook-unit-tests` and `feed-page-hook-tests` are dissolved into their parent feature spec (`feed/filtering.md`) as testing requirements rather than kept as standalone specs.

**Rationale:** These aren't capabilities — they're testing concerns for a capability. Keeping them standalone inflates the spec count and creates artificial separation.

### 4. Execution order: create new structure first, then delete old

Create all 9 domain folders and 27 new spec files first, then delete all 51 old spec directories in a single cleanup step.

**Rationale:** This avoids data loss if the process is interrupted. The old and new specs coexist briefly, but since the new paths are in subdirectories, there are no naming conflicts.

## Risks / Trade-offs

- **Archived changes reference old spec paths** → No migration needed. Archives are historical snapshots and should reflect the spec structure at the time they were created. The `openspec/changes/archive/` directory is untouched.
- **Merge order ambiguity** → When multiple source specs merge into one, requirements are ordered by sub-concern grouping (not alphabetically). The section header makes the grouping clear.
- **Large diff** → 51 deletions + 27 additions in one commit. This is acceptable because it's a pure restructuring with no content changes, making review straightforward.
