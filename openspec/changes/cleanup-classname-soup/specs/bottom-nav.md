# Spec: `<BottomNav>`

## Location

`src/app/components/bottom-nav.tsx`

Placed in `app/` rather than `components/` because `<BottomNav>` depends on `features/sync` through the `SyncNavIcon` entry in `NAV_ITEMS` (`SyncNavIcon` consumes the sync context internally). Shared modules in `src/components/` cannot import from `features/`, but `src/app/` can import from anywhere. This is architecturally honest: the nav bar is app-shell infrastructure, not a reusable shared component.

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

Extracted from `app-layout.tsx` and aligned with the refreshed menu styling from commit `e4f7a0d`. The structure is:

```
<nav> (outer chrome: fixed bottom-bar on mobile, sticky top-bar on sm+)
  <div> (max-width container, gap-2 p-2)
    <Link>* (per nav item; gets `.active` class + `aria-current="page"` when active)
      <span> (inner pill: rounded-lg, gains `bg-primary/10` when parent link is `.active`)
        <span> (icon wrapper with optional badge)
          <Icon />
          {badge}
        </span>
        <span> (label: `sr-only sm:not-sr-only`)
      </span>
    </Link>
  </div>
</nav>
```

The outer `<nav>` className:
```
fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95
pb-[env(safe-area-inset-bottom)] backdrop-blur
supports-[backdrop-filter]:bg-background/60
sm:sticky sm:top-0 sm:z-20 sm:border-b sm:border-t-0 sm:pb-0
```

Active state is expressed via TanStack Router's `activeProps={{ className: "active", "aria-current": "page" }}`, and the inner pill uses `[.active>&]:bg-primary/10` to react to that class.

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
