## Why

Users have no visual indication of how many articles are saved to their read list without navigating to the read list page. A counter badge on the Read List nav icon provides at-a-glance awareness and encourages engagement with saved articles.

## What Changes

- **Counter badge on Read List nav icon** — Display a small pill-shaped badge next to the Bookmark icon showing the number of saved articles.
- **Zero state hidden** — Badge is not rendered when the read list is empty.
- **Capped at 99+** — Counts above 99 display as "99+" to keep the badge compact.
- **Subtle muted style** — Badge uses muted/secondary colors, not attention-grabbing primary.

## Capabilities

### New Capabilities
- `read-list-badge`: Counter badge on the Read List navigation icon showing the number of saved articles, hidden when empty, capped at 99+.

## Impact

- `src/app/app-layout.tsx` — Add badge element to the Read List nav item, conditionally rendered based on read list count. Requires consuming `useArticleState()` or a lighter count-only hook.