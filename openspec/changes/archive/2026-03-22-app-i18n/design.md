## Context

The app currently has no internationalization support. All UI strings are hardcoded in English across ~10 component files (~38 translatable strings). The existing "Language" setting on the settings page filters articles by language rather than controlling the app locale. Date/time formatting in `format-time.ts` and `format-day-label.ts` uses hardcoded German date formats (DD.MM.YYYY) and English relative time strings ("just now", "1 min ago").

The `eslint-plugin-i18next` package is already installed but the `i18next/no-literal-string` rule is disabled, waiting for an i18n system to be adopted.

## Goals / Non-Goals

**Goals:**
- Full i18n infrastructure with German and English translations
- Locale-aware date, time, and relative time formatting via `Intl` APIs
- Automatic locale detection from browser with manual override in settings
- Re-enable ESLint enforcement of translated strings
- Remove language as a feed filter — all articles always visible

**Non-Goals:**
- Supporting more than two languages (de, en) initially
- Server-side rendering or locale-based routing
- Translating article content (articles stay in their source language)
- Right-to-left (RTL) layout support
- Pluralization beyond what `Intl.RelativeTimeFormat` provides natively

## Decisions

### 1. i18next + react-i18next as the i18n library

**Decision:** Use `i18next` with the `react-i18next` binding and `i18next-browser-languagedetector` for locale detection.

**Why:** i18next is the de facto standard for React i18n — mature, well-documented, and the ESLint plugin already installed is designed for it. `react-i18next` provides `useTranslation()` and `<Trans>` for seamless React integration. The browser language detector handles the `navigator.language` fallback automatically.

**Alternative considered:** `react-intl` (FormatJS). Rejected — heavier API surface, message extraction tooling adds build complexity, and the existing ESLint plugin wouldn't work with it.

### 2. Single translation file per language with nested keys

**Decision:** Place translation files at `src/locales/en.json` and `src/locales/de.json` with keys nested by feature area.

```json
{
  "nav": {
    "feed": "Feed",
    "readList": "Read List",
    "settings": "Settings",
    "skipToContent": "Skip to content"
  },
  "feed": {
    "allArticles": "All articles",
    "hidden": "Hidden",
    "searchPlaceholder": "Search articles...",
    "refreshed": "Refreshed {{time}}",
    "loading": "Loading feeds...",
    "empty": "No articles found. Try adjusting your filters.",
    "loadError": "Some feeds failed to load:"
  },
  "settings": {
    "heading": "Settings",
    "language": "Language",
    "appearance": "Appearance",
    "sources": "Sources"
  },
  "readList": {
    "empty": "No saved articles yet. Swipe left or click the bookmark icon to save articles."
  },
  "actions": {
    "hideArticle": "Hide article",
    "unhideArticle": "Unhide article",
    "saveToReadList": "Save to read list",
    "removeFromReadList": "Remove from read list"
  },
  "error": {
    "heading": "Something went wrong",
    "message": "An unexpected error occurred. Please reload the page to try again.",
    "reload": "Reload"
  },
  "time": {
    "today": "today",
    "yesterday": "yesterday"
  }
}
```

**Why:** The app has ~38 strings — a single file per language is manageable and avoids the overhead of namespace loading/splitting. Nesting by feature keeps keys organized and discoverable. Flat dot-notation keys (`feed.empty`) work naturally with i18next's nested key resolution.

**Alternative considered:** One file per feature per language (`src/features/feed/locales/en.json`). Rejected — adds file sprawl for minimal benefit at this scale. Can be migrated to namespaces later if the string count grows significantly.

### 3. Intl APIs for all date/time formatting

**Decision:** Replace the custom formatting functions in `format-time.ts` and `format-day-label.ts` with `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` wrappers. All formatting functions accept a `locale` parameter.

**Why:** `Intl` APIs are built into every modern browser, produce locale-correct output (e.g., `21.03.2026` for `de`, `3/21/2026` for `en`), and handle relative time naturally ("vor 2 Stunden" / "2 hours ago"). Zero dependency cost. The current hand-rolled formatting is a mix of German date format with English relative time strings — inconsistent and not localizable.

**Implementation detail:**
- `formatRelativeTime(date, locale)` → uses `Intl.RelativeTimeFormat` with `numeric: "auto"` (produces "just now" / "gerade eben" for very recent times)
- `formatAbsoluteTime(date, locale)` → uses `Intl.DateTimeFormat` with `dateStyle: "medium"`, `timeStyle: "medium"`
- `formatShortTime(date, locale)` → uses `Intl.DateTimeFormat` with custom options (day, month, hour, minute)
- `formatDayLabel(date, locale)` → uses `Intl.DateTimeFormat` for weekday name + `Intl.RelativeTimeFormat` for "today"/"yesterday"

### 4. Locale detection chain: localStorage → navigator → "en"

**Decision:** Use `i18next-browser-languagedetector` configured with detection order: `["localStorage", "navigator"]`, localStorage key `"newsflash:locale"`, and fallback language `"en"`. Strip region codes to base language (e.g., `de-CH` → `de`). Unsupported languages fall back to `en`.

**Why:** Users who've explicitly chosen a language should keep it. First-time users get the language their browser reports. English fallback is the safest default for an unsupported locale. The `i18next-browser-languagedetector` plugin handles all of this with configuration, no custom code needed.

### 5. Settings UI: two-option locale selector

**Decision:** Replace the current three-option language filter (All / DE / EN) with a two-option app language selector showing the language names in their own language: "Deutsch" and "English". Selecting a language calls `i18next.changeLanguage()` and the detector plugin automatically persists to localStorage.

**Why:** No "All" option — app language is always one or the other. Showing language names in their native form ("Deutsch" not "German") is the standard UX pattern — users can find their language regardless of the current UI language.

### 6. Remove language from feed filter pipeline

**Decision:** Remove the `language` field from `FilterOptions`, remove the language filtering branch from `filterArticles()`, and remove `_language` / `setLanguage` from `useFeedPreferences`. Keep the `language` field on `Connector` and `NormalizedArticle` types unchanged.

**Why:** Language is no longer a content filter — it's an app-level concern. The article `language` field is still useful as metadata (badges, potential future features). Clean removal keeps the filter pipeline simple.

### 7. Re-enable `i18next/no-literal-string` ESLint rule

**Decision:** Set `i18next/no-literal-string` to `"warn"` in `eslint.config.mjs`. Fix all existing violations as part of the string extraction work.

**Why:** The rule was disabled explicitly because no i18n system existed (noted in the dx-improvements change). With i18next in place, the rule catches untranslated strings at lint time. Using `"warn"` rather than `"error"` allows incremental adoption without blocking CI if a string is missed.

**Configuration:** The rule will need `ignoreAttribute` configuration for non-user-facing attributes like `role`, `data-testid`, `className`, etc.

## Risks / Trade-offs

- **[Risk] Bundle size increase from i18next** → Mitigation: i18next core is ~8KB gzipped, react-i18next ~3KB. Acceptable for the capability gained. Translation JSON files are negligible.
- **[Risk] `Intl.RelativeTimeFormat` output may differ slightly from current strings** → Acceptable: locale-correct output is better than hand-rolled English. Users get natural phrasing in their language.
- **[Trade-off] Losing the feed language filter means users see articles in languages they may not read** → Acceptable: per the user's decision. Individual feeds can still be disabled per-source on the settings page, which is a more granular control.
- **[Risk] ESLint `no-literal-string` false positives on CSS classes, data attributes, etc.** → Mitigation: configure `ignoreAttribute` list and `ignoreProperty` for known non-translatable patterns.
- **[Trade-off] Two translation files to maintain** → Acceptable: ~38 strings per language, manageable manually. Automated key extraction tooling can be added later if needed.