## 1. Fix unstable references

- [x] 1.1 Add `useMemo` import to `use-article-state.ts`
- [x] 1.2 Wrap `readListArticles` derivation in `useMemo` with `[storedReadList]` dependency
- [x] 1.3 Wrap `readListIds` derivation in `useMemo` with `[storedReadList]` dependency

## 2. Verify

- [x] 2.1 Run existing `use-article-state.test.ts` and confirm tests pass
- [x] 2.2 Verify Read List page renders without crash in browser
