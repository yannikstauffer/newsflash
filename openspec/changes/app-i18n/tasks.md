## Tasks

### 1. Install dependencies and set up i18n infrastructure
- [x] Install `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- [x] Create `src/lib/i18n.ts` — initialize i18next with browser language detector, configure detection order (`localStorage` key `"newsflash:locale"` → `navigator` → `"en"` fallback), set supported languages `["de", "en"]`
- [x] Create `src/locales/en.json` with all English translations (nested by feature: `nav`, `feed`, `settings`, `readList`, `actions`, `error`, `time`)
- [x] Create `src/locales/de.json` with all German translations
- [x] Import and execute i18n init in app entry point (`src/main.tsx`)
- [x] Write tests for i18n initialization and locale detection fallback chain

### 2. Replace date/time formatting with Intl wrappers
- [x] Rewrite `src/features/feed/utils/format-time.ts` — replace `formatRelativeTime` with `Intl.RelativeTimeFormat` (accepting `locale` param), replace `formatAbsoluteTime` and `formatShortTime` with `Intl.DateTimeFormat`
- [x] Rewrite `src/features/feed/utils/format-day-label.ts` — replace hardcoded weekday array and "today"/"yesterday" strings with `Intl.DateTimeFormat` (weekday) and `Intl.RelativeTimeFormat` (`numeric: "auto"` for today/yesterday)
- [x] Update all call sites to pass the active locale
- [x] Update existing tests for both `de` and `en` locale outputs

### 3. Remove language from feed filter pipeline
- [x] Remove `language` field from `FilterOptions` in `src/features/feed/utils/filter-articles.ts`
- [x] Remove the language filtering branch from `filterArticles()`
- [x] Remove `LanguagePreference` type, `_language` field, and `setLanguage` from `src/features/feed-config/hooks/use-feed-preferences.ts`
- [x] Update `src/features/feed/hooks/use-feed-page.ts` — stop passing language to `filterArticles()`
- [x] Update unit tests in `filter-articles.test.ts` — remove language filter test cases
- [x] Update unit tests in `use-feed-preferences.test.ts` — remove language preference tests
- [x] Update E2E tests in `tests-e2e/settings.spec.ts` — remove language filter scenarios

### 4. Localize all components with useTranslation
- [x] `src/app/app-layout.tsx` — wrap with i18n provider, replace "Skip to content", "Feed", "Read List", "Settings", "Main navigation" with `t()` calls
- [x] `src/features/feed/components/filter-bar.tsx` — replace "All articles", "Hidden", "Search articles...", "Refreshed", day navigation aria-labels with `t()` calls; pass locale to date formatting utilities
- [x] `src/features/feed/components/feed-list.tsx` — replace "Loading feeds...", empty state message, "Some feeds failed to load:" with `t()` calls
- [x] `src/features/article-actions/components/article-action-buttons.tsx` — replace "Hide article", "Save to read list", "Remove from read list", "Unhide article" aria-labels with `t()` calls
- [x] `src/features/article-actions/components/read-list-page.tsx` — replace empty state message with `t()` call
- [x] `src/components/error-boundary.tsx` — replace "Something went wrong", error message, and "Reload" with `t()` calls (use `withTranslation` HOC for class component)

### 5. Rework settings page language selector
- [x] Replace three-option language filter (All / DE / EN) with two-option locale selector ("Deutsch" / "English") in `src/features/feed-config/components/feed-config-page.tsx`
- [x] Wire selector to `i18next.changeLanguage()` — detector plugin handles localStorage persistence automatically
- [x] Localize all other settings page strings ("Settings", "Appearance", "Sources") with `t()` calls
- [x] Update `aria-label` on radiogroup to use translated label
- [x] Update E2E tests for new language selector behavior

### 6. Re-enable ESLint i18next rule
- [x] Set `i18next/no-literal-string` to `"warn"` in `eslint.config.mjs`
- [x] Configure `ignoreAttribute` for non-user-facing attributes (`role`, `data-testid`, `className`, `htmlFor`, `type`, `name`, `id`, `href`, `target`, `rel`)
- [x] Run `npm run lint` and fix any remaining warnings on changed files

### 7. Update specs and verify
- [x] Update `openspec/specs/feed-filtering/spec.md` — remove language filter requirement, update AND logic scenario
- [x] Update `openspec/specs/feed-configuration/spec.md` — update language selector requirement to reflect locale behavior
- [x] Run full test suite (`npm run test`) — all tests pass
- [x] Run E2E tests (`npm run test:e2e`) — all tests pass
- [x] Run lint (`npm run lint`) — no errors
