## Why

The language setting currently filters feed articles by language (All / DE / EN). This is the wrong abstraction — language should control the app's UI, not which content is visible. Users reading both German and English feeds shouldn't have to choose. Meanwhile, the entire UI is hardcoded in English with no localization support, and there's no i18n infrastructure to build on.

## What Changes

- **Remove language as a feed filter**: Drop the `language` field from `FilterOptions` and the corresponding filter branch in `filterArticles()`. Remove `_language` from feed preferences storage. All articles show regardless of language.
- **Add i18n infrastructure**: Introduce `i18next` + `react-i18next` with two translation files (`src/locales/en.json`, `src/locales/de.json`). Nested keys grouped by feature (e.g., `feed.empty`, `settings.language`).
- **Locale detection**: Check `localStorage("newsflash:locale")` → `navigator.language` (stripped to base code, e.g., `de-CH` → `de`) → `"en"` fallback.
- **Localize all user-facing strings**: Extract ~38 UI strings across feed page, settings, article actions, navigation, and error boundary into translation files. Use `useTranslation()` / `t()` throughout.
- **Localize date/time formatting**: Add `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` wrappers that respect the active locale. Replace hardcoded date formatting with locale-aware utilities.
- **Rework settings UI**: Replace the three-option language filter (All / DE / EN) with a two-option app language selector (Deutsch / English) that calls `i18next.changeLanguage()` and persists to `localStorage("newsflash:locale")`.
- **Re-enable `i18next/no-literal-string`**: The ESLint rule was disabled because no i18n system existed. Re-enable it so untranslated strings are caught at lint time.
- **Keep article language metadata**: The `language` field on `Connector` and `NormalizedArticle` remains unchanged — it's useful for display badges and potential future features.

## Capabilities

### New Capabilities

- `i18n-infrastructure`: i18next + react-i18next setup with locale detection (localStorage → browser → fallback), two translation files (en/de), and `Intl`-based date/time formatting utilities.
- `app-locale-setting`: Settings UI for switching app language between Deutsch and English, persisted to localStorage, triggering full UI re-render in the selected language.

### Modified Capabilities

- `feed-filtering`: Language filter removed. Articles are no longer filtered by language — all enabled feeds show regardless of article language.
- `feed-configuration`: Language section repurposed from feed filter to app locale selector. Storage key changes from `newsflash:feed-prefs._language` to `newsflash:locale`.
- `filter-bar-refinement`: Any date/time displays ("Refreshed X ago") use locale-aware formatting.
- `error-boundary`: Error messages localized via translation keys.

## Impact

- **New files**: `src/locales/en.json`, `src/locales/de.json`, `src/lib/i18n.ts` (init + config), `src/utils/format-date.ts` (Intl wrappers)
- **Dependencies**: Add `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- **Modified**: `src/features/feed/utils/filter-articles.ts` (remove language filter), `src/features/feed-config/hooks/use-feed-preferences.ts` (remove language preference), `src/features/feed-config/components/feed-config-page.tsx` (locale selector), `src/app/app-layout.tsx` (i18n provider + localized nav), `src/features/feed/components/filter-bar.tsx`, `src/features/feed/components/feed-list.tsx`, `src/features/article-actions/components/*.tsx`, `src/components/error-boundary.tsx`, `eslint.config.mjs` (re-enable rule)
- **Specs**: Update `openspec/specs/feed-filtering/spec.md` to remove language filter requirements
- **Tests**: Update/remove language filter unit tests and E2E tests, add i18n-specific tests (locale detection, language switching, translated renders)
