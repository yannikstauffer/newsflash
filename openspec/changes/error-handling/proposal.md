## Why

No React error boundary exists anywhere in the app. Runtime exceptions crash the entire application with a white screen, forcing users to manually reload. Additionally, `base-parser.ts` catches all XML parse errors and silently returns an empty array with no logging, making it impossible to debug feed format changes or connector issues.

## What Changes

- Add a top-level React error boundary wrapping the `<main>` content area in `AppLayout`, so runtime errors are caught and a user-friendly fallback is shown instead of a white screen.
- Add `console.error` logging in the XML parse `catch` block in `base-parser.ts` so parse failures are visible in developer tools.

## Capabilities

### New Capabilities

- `error-boundary`: A React class component that catches runtime errors in its subtree, displays a user-friendly error message with a "Reload" button, and logs the error to `console.error`.

### Modified Capabilities

## Impact

- `src/app/app-layout.tsx`: Wrap `<main>` children with the new error boundary component.
- New file `src/components/error-boundary.tsx`: The error boundary class component.
- `src/features/connectors/base-parser.ts`: Add `console.error` call in the existing `catch` block of `parseRss`.
