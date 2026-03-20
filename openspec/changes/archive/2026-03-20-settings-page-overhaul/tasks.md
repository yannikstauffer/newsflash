## 1. Language Preference Persistence

- [x] 1.1 Extend `useFeedPreferences` to store and expose `language` preference (`"all" | "de" | "en"`, default `"all"`)
- [x] 1.2 Add `setLanguage` function to the hook's return value
- [x] 1.3 Write tests for language preference read/write/default behavior

## 2. Settings Page Layout Restructure

- [x] 2.1 Add page heading (`Settings`) to `feed-config-page.tsx`
- [x] 2.2 Add "Language" section with segmented control (All / DE / EN) wired to `useFeedPreferences`
- [x] 2.3 Add "Sources" section heading
- [x] 2.4 Wrap source groups in a bordered, rounded container with dividers between sources
- [x] 2.5 Style source headers (name + language badge) and indented sub-feed checkboxes within each group

## 3. localStorage Cleanup on Source Deactivation

- [x] 3.1 Add `removeHiddenBySource(sourceId: string)` to `useArticleState` that filters hidden IDs by source prefix
- [x] 3.2 Add `removeReadListBySource(sourceId: string)` to `useArticleState` that filters read list entries by source field
- [x] 3.3 In `feed-config-page.tsx`, detect when all feeds for a source become disabled and call cleanup functions
- [x] 3.4 Write tests for `removeHiddenBySource` and `removeReadListBySource`

## 4. Verification

- [x] 4.1 Run `npm run lint` and fix any issues
- [x] 4.2 Run `npm run test` and verify all tests pass
- [x] 4.3 Run JetBrains diagnostics on changed files
