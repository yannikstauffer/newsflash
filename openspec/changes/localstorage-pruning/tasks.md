## 1. Add pruning constants and logic

- [ ] 1.1 Add exported constants `MAX_HIDDEN_IDS = 500` and `MAX_READLIST_ITEMS = 200` to `src/features/article-actions/hooks/use-article-state.ts`
- [ ] 1.2 Update `hideArticle` callback to truncate the hidden IDs array to `MAX_HIDDEN_IDS` after prepending a new ID
- [ ] 1.3 Update `addToReadList` callback to truncate the read list array to `MAX_READLIST_ITEMS` after prepending a new article

## 2. Tests

- [ ] 2.1 Add test: hiding an article when list is under the limit does not prune
- [ ] 2.2 Add test: hiding an article at exactly 500 entries drops the oldest entry
- [ ] 2.3 Add test: hiding an article with an oversized existing list truncates to 500
- [ ] 2.4 Add test: duplicate hidden ID does not trigger pruning or list change
- [ ] 2.5 Add test: adding to read list when under the limit does not prune
- [ ] 2.6 Add test: adding to read list at exactly 200 entries drops the oldest article
- [ ] 2.7 Add test: adding to read list with an oversized existing list truncates to 200
- [ ] 2.8 Add test: duplicate article in read list does not trigger pruning or list change
- [ ] 2.9 Add test: `MAX_HIDDEN_IDS` and `MAX_READLIST_ITEMS` are importable and have correct values

## 3. Verify

- [ ] 3.1 Run existing `use-article-state.test.ts` tests to confirm no regressions
- [ ] 3.2 Run linting (`npm run lint`) on changed files
- [ ] 3.3 Run IDE diagnostics on changed files
