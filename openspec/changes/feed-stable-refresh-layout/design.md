## Context

The feed page renders two independent status indicators between the filter bar and the article list:

1. **"Refreshed X ago"** — driven by `lastRefreshedAt` state in `useFeedData`, which starts `null` on every mount (module-level `feedCache` is cleared on full reload) and only gets a value after the network fetch resolves.
2. **"Synced X ago"** — rendered by `LastSyncedIndicator`, which reads `lastSyncedAt` asynchronously from IndexedDB on mount and renders `null` until the promise resolves.

Both pop into the DOM asynchronously, each time pushing the article list downward. This happens on periodic background refreshes without any user interaction.

## Goals / Non-Goals

**Goals:**
- Eliminate all layout shifts in the status area between the filter bar and feed list
- Merge both timestamps into a single row with consistent height
- Ensure the status row has content on first paint (synchronous hydration)

**Non-Goals:**
- Changing the refresh/sync timing or frequency
- Fixing article list flickering during refresh (separate change: `feed-stable-refresh-list`)
- Redesigning the overall feed page layout

## Decisions

### 1. Single `FeedStatusRow` component replaces both indicators

**Choice:** Create a new `FeedStatusRow` component that renders one line combining both timestamps. Remove `LastSyncedIndicator` as a standalone component.

**Why over keeping them separate:** Two separate async blocks = two shift opportunities. A single component with a reserved slot eliminates both. It also reads better: "Refreshed 2m ago · Synced 5m ago" gives a complete picture at a glance.

**Format:** `"Refreshed {time} · Synced {time}"` — either half omitted gracefully if unavailable, but the row always occupies its slot.

### 2. Reserved height via `min-h` on the status row container

**Choice:** The status row container uses a fixed `min-h-5` (20px, matching `text-xs` line height) so the slot is always present in the layout, even when both timestamps are `null`.

**Why over conditional rendering:** Conditional rendering (`{x && <p>...}`) is the root cause of the shifts. A reserved slot with invisible-until-ready text costs nothing visually (20px of whitespace that's already implied by the `gap-4` in the parent flex) and guarantees zero CLS.

**Why over skeleton/placeholder text:** A skeleton would draw attention to loading state for something that resolves in <100ms. Empty space is less distracting.

### 3. Persist `lastRefreshedAt` to localStorage (not IndexedDB)

**Choice:** Write `lastRefreshedAt` as an ISO string to `localStorage` under key `newsflash:last-refreshed-at`. Read it synchronously in `useFeedData`'s initial state.

**Why localStorage over IndexedDB:** localStorage is synchronous — we can read it in the `useState` initializer, so the value is present on the very first render. IndexedDB is async and would still require a null→value transition.

**Why not also move `lastSyncedAt` to localStorage:** `lastSyncedAt` is written by the sync service which also stores other metadata in IndexedDB. Moving just one key adds inconsistency. Instead, we mirror `lastSyncedAt` to localStorage as a write-through cache: `setLastSyncedAt` writes to both IDB (source of truth) and localStorage (fast read path).

### 4. `lastSyncedAt` gets a synchronous localStorage mirror

**Choice:** In `sync-metadata.ts`, `setLastSyncedAt` also writes to `localStorage` key `newsflash:last-synced-at`. A new export `getLastSyncedAtSync(): Date | null` reads from localStorage synchronously.

**Why:** This lets `FeedStatusRow` hydrate both timestamps synchronously without changing the IndexedDB-based architecture. The IDB path remains the source of truth; localStorage is a read cache.

## Risks / Trade-offs

- **[Stale timestamp on first paint]** → If the last session ended hours ago, the status row will briefly show "Refreshed 3h ago" until the network fetch completes. This is accurate and better than showing nothing. The timestamp updates as soon as fresh data arrives.
- **[localStorage quota]** → Two small ISO strings (~50 bytes total). No risk.
- **[localStorage disabled/unavailable]** → Falls back gracefully to the current behavior (null on mount, async resolution). The reserved height still prevents shifts; only the "content on first paint" benefit is lost.
- **[Removing LastSyncedIndicator]** → Need to verify it's not used elsewhere. If it is, keep it as a thin wrapper around `getLastSyncedAtSync()`.
