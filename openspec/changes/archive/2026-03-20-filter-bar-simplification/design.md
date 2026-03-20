## Context

The filter bar currently has two rows: source pills + refresh on row 1, language/hidden/search on row 2. Source selection is duplicated between the filter bar pills and the settings page checkboxes. Language is local state in `FeedPage`.

## Goals / Non-Goals

**Goals:**
- Remove source pills and language selector from the filter bar
- Simplify `FilterBar` component props and `FeedPage` state
- Feed page reads source/language preferences from shared hooks

**Non-Goals:**
- Changing the settings page (covered by `settings-page-overhaul`)
- Persisting language preference (covered by `settings-page-overhaul`)
- Changing search or hidden toggle behavior

## Decisions

### 1. Remove local source state from FeedPage entirely

`FeedPage` currently maintains its own `enabledSources` Set. After this change, it reads source enablement directly from `useFeedPreferences().isFeedEnabled` — the same hook the settings page uses. The connector-level filter is replaced by feed-level filter from preferences.

### 2. Language preference read from a shared hook

A new `useLanguagePreference` hook (or extension of `useFeedPreferences`) reads the persisted language from localStorage. `FeedPage` calls this hook instead of maintaining local `language` state. The hook itself is created as part of the `settings-page-overhaul` change; this change just consumes it.

**Dependency note:** This change depends on `settings-page-overhaul` having created the language persistence hook. If implementing independently, a temporary local default of `"all"` can be used.

### 3. FilterBar becomes a single-row component

With source pills and language removed, the remaining controls (hidden toggle, search, refresh) fit in one row. The `space-y-3` wrapper with two inner divs collapses to a single `flex` container.

## Risks / Trade-offs

- **Dependency on settings-page-overhaul** — language preference needs to be persisted before this change can fully work. Can be mitigated by implementing settings-page-overhaul first or using a fallback default.
