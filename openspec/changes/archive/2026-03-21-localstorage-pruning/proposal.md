## Why

The `newsflash:hidden` and `newsflash:readlist` localStorage keys grow unbounded over time. Since localStorage has a 5-10 MB limit, long-term users will eventually hit quota errors, silently losing new data. Adding bounded-buffer pruning prevents this with zero new dependencies and no async refactoring.

## What Changes

- Add a `maxItems` limit to the hidden article IDs list (cap at 500, drop oldest on overflow)
- Add a `maxItems` limit to the read list (cap at 200, drop oldest on overflow)
- Pruning happens transparently on write inside the existing `useArticleState` hook
- No changes to the public API of any hook — consumers are unaffected
- No new dependencies

## Capabilities

### New Capabilities
- `storage-pruning`: Bounded-buffer pruning logic for array-typed localStorage entries, enforced on write inside domain hooks

### Modified Capabilities

## Impact

- `src/features/article-actions/hooks/use-article-state.ts` — add pruning to `hideArticle` and `addToReadList` callbacks
- `src/features/article-actions/hooks/use-article-state.test.ts` — add tests for pruning behavior and edge cases
- No API changes, no dependency changes, no breaking changes
