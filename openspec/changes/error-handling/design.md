## Context

The newsflash app is a Vite 8 + React 19 + TypeScript SPA. Currently, any unhandled runtime exception in the React component tree causes the entire app to unmount, leaving the user with a blank white screen and no recovery path. Separately, the XML feed parser in `base-parser.ts` silently swallows all parse errors, returning an empty array with no logging, making feed debugging impossible.

## Goals / Non-Goals

**Goals:**

- Prevent white-screen crashes by catching React runtime errors and displaying a recoverable fallback UI.
- Make XML parse failures visible in the browser console for developer debugging.
- Keep the implementation minimal and dependency-free.

**Non-Goals:**

- External error reporting or monitoring service integration (can be added later).
- Granular per-feature error boundaries (the top-level boundary is sufficient for now).
- Retry logic for failed XML parses (the fetch layer already handles retries).
- Fancy error UI or branded error pages.

## Decisions

**1. Custom class component over a library (e.g., react-error-boundary)**

React error boundaries must be class components; there is no hook equivalent. The `react-error-boundary` library adds convenience but is unnecessary for a single top-level boundary with a simple fallback. A custom class component keeps the dependency count at zero and is roughly 30 lines of code.

Alternative considered: `react-error-boundary` package. Rejected because it adds a dependency for minimal benefit at this scope.

**2. Boundary placement: wrapping `<main>` children only**

The error boundary wraps the content inside `<main>` in `AppLayout`, not the entire app. This preserves the navigation header even during an error, allowing the user to see context and use the "Reload" button. If the boundary wrapped the entire app, the nav would disappear too.

Alternative considered: Wrapping the entire `<App />` at the root. Rejected because it removes all navigation context from the error state.

**3. console.error for parse failures**

Adding `console.error` in the `catch` block of `parseRss` is the simplest way to surface parse errors. It includes the source name and the error object for debugging.

Alternative considered: Surfacing parse errors in the UI. Rejected as out of scope; the user does not need to see parse-level details. Console logging is sufficient for developers.

## Risks / Trade-offs

- [Minimal fallback UI] The error fallback is intentionally simple (message + reload button). If branding or richer error UIs are needed later, the boundary component can be extended. → Acceptable trade-off for speed of delivery.
- [Single boundary] A single top-level boundary means any error resets the entire content area. Per-feature boundaries could provide more granular recovery. → Mitigated by keeping the boundary scoped to `<main>` content; nav remains functional. Granular boundaries can be added incrementally.
- [No error reporting] Errors are only logged to the console, not sent to an external service. Production errors may go unnoticed. → Acceptable for the current scale; external reporting can be layered on later without changing the boundary architecture.
