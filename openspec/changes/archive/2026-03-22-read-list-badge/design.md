## Design

### Approach: Inline Badge in Nav Item

Add a badge element as a sibling to the Bookmark icon inside the Read List nav link. Position it with `absolute` relative to the icon container.

### Badge Rendering

```
┌──────────────────────┐
│     relative          │
│   ┌──────┐            │
│   │  🔖  │            │
│   │    ┌────┐         │
│   │    │ 3  │ badge   │
│   │    └────┘         │
│   └──────┘            │
└──────────────────────┘
```

The icon gets a `relative` wrapper. The badge is `absolute -top-1.5 -right-2.5` (or similar) to sit at the top-right of the icon.

### Badge Styles

- **Shape**: Pill / rounded-full
- **Size**: `min-w-[18px] h-[18px] text-[10px]` — compact, readable
- **Colors**: `bg-muted text-muted-foreground` — subtle, not attention-grabbing
- **Content**:
  - Count 0 → badge hidden (not rendered)
  - Count 1–99 → show number
  - Count 100+ → show "99+"

### Data Source

`useArticleState()` is already available in the component tree. The read list count can be derived from `readListArticles.length` or `readListIds.length`.

**Option considered: separate lightweight hook** — A count-only hook that reads just the array length from localStorage would avoid parsing the full stored articles array. However, `useArticleState()` is already called elsewhere in the app and the data is in memory via React state. Adding a separate hook for the same localStorage key could cause sync issues. Use the existing hook.

### Architecture Boundary

`useArticleState()` lives in `src/features/article-actions/`. The badge renders in `src/app/app-layout.tsx`. Since `app/` can import from `features/`, this is allowed by the module boundary rules.

### Accessibility

- Badge is decorative (the count supplements the "Read List" label, it doesn't replace it)
- Add `aria-label` to the nav link that includes the count: `"Read List (3 saved)"` or `"Read List"` when empty
- Badge element gets `aria-hidden="true"` since the count is in the link's aria-label
