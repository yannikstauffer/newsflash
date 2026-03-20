## Context

The settings page (`feed-config-page.tsx`) renders connectors with checkboxes. Preferences are stored via `useFeedPreferences` in `newsflash:feed-prefs`. Article state (hidden IDs, read list) is stored separately in `newsflash:hidden` and `newsflash:readlist` via `useArticleState`.

## Goals / Non-Goals

**Goals:**
- Add language preference persistence to localStorage
- Improve settings page visual structure with sections, cards, and dividers
- Clean up localStorage when sources are fully deactivated

**Non-Goals:**
- Adding new settings beyond language and sources
- Dark mode toggle (covered by `theme-softening`)
- Changing feed-config hook API beyond what's needed

## Decisions

### 1. Language preference stored in `useFeedPreferences`

Extend the existing `useFeedPreferences` hook to include a `language` field stored alongside feed preferences in the same `newsflash:feed-prefs` localStorage key. The stored shape becomes `{ feedId: boolean, ..., _language: "all" | "de" | "en" }`. The underscore prefix avoids collision with feed IDs.

**Why not a separate hook?** Language is a feed-level preference. Keeping it in the same hook avoids an extra localStorage key and keeps all feed-related preferences co-located.

### 2. Structured layout with semantic sections

The settings page will use:
- A page heading (`<h2>Settings</h2>`)
- Sections with `<h3>` headings: "Language", "Sources"
- Source groups wrapped in a bordered container with dividers between sources
- Sub-feed checkboxes indented within each source group

Uses existing Tailwind utilities — no new UI components needed.

### 3. localStorage cleanup via callback from settings page

When `setAllForSource` disables all feeds for a source, the settings page calls cleanup functions on `useArticleState`: `removeHiddenBySource(sourceId)` and `removeReadListBySource(sourceId)`. These new functions filter out entries matching the source.

**Why triggered from settings, not from the hook?** The cleanup is a side effect of a user action (deactivating a source), not an automatic behavior. Making it explicit at the call site is clearer and avoids unexpected data loss.

### 4. Cleanup only when ALL feeds for a source are disabled

Partial deactivation (one sub-feed off, others still on) does not trigger cleanup. This prevents accidental data loss when the user is just adjusting sub-feed selection.

## Risks / Trade-offs

- **Hidden IDs don't store source** — the `newsflash:hidden` key stores only article IDs, not source. To clean up, we need to either: (a) change the storage format to include source, or (b) match hidden IDs against known article ID patterns that include the source prefix. Looking at the codebase, article IDs include the source name, so pattern matching is feasible without a migration.
- **Read list entries store full article data** — `newsflash:readlist` stores `StoredArticle` objects with a `source` field, so filtering by source is straightforward.
