## Tasks

### 1. Install dependencies and set up i18n infrastructure
- [ ] Install `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- [ ] Create `src/lib/i18n.ts` — initialize i18next with browser language detector, configure detection order (`localStorage` key `"newsflash:locale"` → `navigator` → `"en"` fallback), set supported languages `["de", "en"]`
- [ ] Create `src/locales/en.json` with all English translations (nested by feature: `nav`, `feed`, `settings`, `readList`, `actions`, `error`, `time`)
- [ ] Create `src/locales/de.json` with all German translations
- [ ] Import and execute i18n init in app entry point (`src/main.tsx`)
- [ ] Write tests for i18n initialization and locale detection fallback chain

### 2. Replace date/time formatting with Intl wrappers
- [ ] Rewrite `src/features/feed/utils/format-time.ts` — replace `formatRelativeTime` with `Intl.RelativeTimeFormat` (accepting `locale` param), replace `formatAbsoluteTime` and `formatShortTime` with `Intl.DateTimeFormat`
- [ ] Rewrite `src/features/feed/utils/format-day-label.ts` — replace hardcoded weekday array and "today"/"yesterday" strings with `Intl.DateTimeFormat` (weekday) and `Intl.RelativeTimeFormat` (`numeric: "auto"` for today/yesterday)
- [ ] Update all call sites to pass the active locale
- [ ] Update existing tests for both `de` and `en` locale outputs

### 3. Remove language from feed filter pipeline
- [ ] Remove `language` field from `FilterOptions` in `src/features/feed/utils/filter-articles.ts`
- [ ] Remove the language filtering branch from `filterArticles()`
- [ ] Remove `LanguagePreference` type, `_language` field, and `setLanguage` from `src/features/feed-config/hooks/use-feed-preferences.ts`
- [ ] Update `src/features/feed/hooks/use-feed-page.ts` — stop passing language to `filterArticles()`
- [ ] Update unit tests in `filter-articles.test.ts` — remove language filter test cases
- [ ] Update unit tests in `use-feed-preferences.test.ts` — remove language preference tests
- [ ] Update E2E tests in `tests-e2e/settings.spec.ts` — remove language filter scenarios

### 4. Localize all components with useTranslation
- [ ] `src/app/app-layout.tsx` — wrap with i18n provider, replace "Skip to content", "Feed", "Read List", "Settings", "Main navigation" with `t()` calls
- [ ] `src/features/feed/components/filter-bar.tsx` — replace "All articles", "Hidden", "Search articles...", "Refreshed", day navigation aria-labels with `t()` calls; pass locale to date formatting utilities
- [ ] `src/features/feed/components/feed-list.tsx` — replace "Loading feeds...", empty state message, "Some feeds failed to load:" with `t()` calls
- [ ] `src/features/article-actions/components/article-action-buttons.tsx` — replace "Hide article", "Save to read list", "Remove from read list", "Unhide article" aria-labels with `t()` calls
- [ ] `src/features/article-actions/components/read-list-page.tsx` — replace empty state message with `t()` call
- [ ] `src/components/error-boundary.tsx` — replace "Something went wrong", error message, and "Reload" with `t()` calls (use `withTranslation` HOC for class component)

### 5. Rework settings page language selector
- [ ] Replace three-option language filter (All / DE / EN) with two-option locale selector ("Deutsch" / "English") in `src/features/feed-config/components/feed-config-page.tsx`
- [ ] Wire selector to `i18next.changeLanguage()` — detector plugin handles localStorage persistence automatically
- [ ] Localize all other settings page strings ("Settings", "Appearance", "Sources") with `t()` calls
- [ ] Update `aria-label` on radiogroup to use translated label
- [ ] Update E2E tests for new language selector behavior

### 6. Re-enable ESLint i18next rule
- [ ] Set `i18next/no-literal-string` to `"warn"` in `eslint.config.mjs`
- [ ] Configure `ignoreAttribute` for non-user-facing attributes (`role`, `data-testid`, `className`, `htmlFor`, `type`, `name`, `id`, `href`, `target`, `rel`)
- [ ] Run `npm run lint` and fix any remaining warnings on changed files

### 7. Update specs and verify
- [ ] Update `openspec/specs/feed-filtering/spec.md` — remove language filter requirement, update AND logic scenario
- [ ] Update `openspec/specs/feed-configuration/spec.md` — update language selector requirement to reflect locale behavior
- [ ] Run full test suite (`npm run test`) — all tests pass
- [ ] Run E2E tests (`npm run test:e2e`) — all tests pass
- [ ] Run lint (`npm run lint`) — no errors
