# Spec: `<BottomNav>`

## Location

`src/app/components/bottom-nav.tsx`

Placed in `app/` rather than `components/` because `<BottomNav>` depends on `features/sync` (both `SyncNavIcon` and `useSyncContext` via `NAV_ITEMS`). Shared modules in `src/components/` cannot import from `features/`, but `src/app/` can import from anywhere. This is architecturally honest: the nav bar is app-shell infrastructure, not a reusable shared component.

## Props

```tsx
interface BottomNavProps {
  readonly readListCount: number
}
```

## What moves from `app-layout.tsx`

- `NavItem` interface
- `NAV_ITEMS` constant
- `formatBadgeCount` helper
- The entire `<nav>` element (lines 51-92)

## Markup

Identical to current `app-layout.tsx` lines 51-92. No class changes — just extraction.

The `<nav>` className stays as-is:
```
fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95
pb-[env(safe-area-inset-bottom)] backdrop-blur
supports-[backdrop-filter]:bg-background/60
sm:sticky sm:top-0 sm:z-20 sm:border-b sm:border-t-0 sm:pb-0
```

This is a long className but it's in one place now (the component definition) rather than cluttering the app shell.

## Dependencies

- `@tanstack/react-router` (Link)
- `lucide-react` (Newspaper, Bookmark)
- `react-i18next` (useTranslation)
- `@/features/sync/components/sync-nav-icon` (SyncNavIcon)

Because `<BottomNav>` lives in `src/app/components/`, it can import from `features/sync` without violating module boundaries.

## Test requirements

- Renders all three nav items
- Shows badge count when readListCount > 0
- Formats badge as "99+" when count > 99
- Hides badge when readListCount is 0
- Active link gets aria-current="page"
