## Why

The main navigation is currently a sticky top header on all screen sizes. On mobile, this puts nav items in the hardest-to-reach thumb zone. Moving the nav to the bottom on mobile follows the established iOS tab bar / Material bottom nav pattern, making one-handed use comfortable.

## What Changes

- **Bottom-fixed nav on mobile** — On screens below `sm` (640px), render the navigation as a `fixed bottom-0` bar instead of a sticky top header. Always visible (no auto-hide on scroll).
- **Safe area padding** — Add `env(safe-area-inset-bottom)` padding to support iOS devices with home indicator gesture bar.
- **Content padding** — Add bottom padding to `<main>` on mobile to prevent content from being hidden behind the fixed nav.
- **Active indicator** — Switch from bottom border underline to top border on mobile bottom nav for visual consistency.
- **Desktop unchanged** — On `sm` and above, keep the current sticky top header with labels.

## Capabilities

### Modified Capabilities
- `app-layout`: Navigation renders at bottom on mobile (`< sm`), top on desktop (`≥ sm`). Fixed position on mobile, sticky on desktop. Safe area insets for iOS.

## Impact

- `src/app/app-layout.tsx` — Split nav rendering: bottom-fixed on mobile, sticky-top on desktop. Add bottom padding to main content on mobile. Add safe-area support.