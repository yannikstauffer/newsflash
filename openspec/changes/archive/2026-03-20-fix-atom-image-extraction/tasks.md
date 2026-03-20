## 1. Core Fix

- [x] 1.1 Refactor `parseAtomEntries()` in `base-parser.ts` to try `extractLeadingImage` on `content` first, then fall back to `summary` for image extraction, while keeping description text sourced from `summary ?? content`

## 2. Tests

- [x] 2.1 Add test: Atom entry with image in `content` but plain text in `summary` — image extracted from content, description from summary
- [x] 2.2 Add test: Atom entry with image in `summary` only — image extracted from summary
- [x] 2.3 Add test: Atom entry with no image in either field — imageUrl is undefined
- [x] 2.4 Run existing tests to verify no regressions
