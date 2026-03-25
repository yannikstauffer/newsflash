## Context

Newsflash is a Vite + React SPA that stores all user state in localStorage via a central `useLocalStorage<T>` hook. Three keys hold user-facing data: `newsflash:hidden` (string[], max 500), `newsflash:readlist` (StoredArticle[], max 200), and `newsflash:feed-prefs` (Record<string, boolean>). Feature hooks (`useArticleState`, `useFeedPreferences`) consume `useLocalStorage` directly.

There is no backend, no authentication, and no server-side state. The app is fully client-side with connector data fetched through a feed proxy.

## Goals / Non-Goals

**Goals:**
- Sync hidden articles, read list, and feed preferences across devices for authenticated users
- Offline-first: app works identically without authentication or network
- Minimal infrastructure: leverage Supabase free tier, no self-hosted services
- Simple auth: magic link email, no passwords
- Clear sync status feedback in the UI (nav icon states, settings page)

**Non-Goals:**
- Real-time sync (WebSocket subscriptions) — periodic and on-demand is sufficient
- Theme sync — theme stays per-device
- Conflict resolution UI ("pick which version") — last-write-wins is sufficient for small group
- User management / admin panel
- Data export/import functionality
- Multi-tenant or team-based sync

## Decisions

### 1. Supabase as backend

**Choice:** Supabase (managed, free tier) over Firebase, Cloudflare KV, or custom API.

**Why:** Free tier provides 500MB storage and unlimited API requests for small projects. Postgres underneath means low vendor lock-in — data can be migrated to any Postgres host. Built-in auth with magic link support. Row-level security eliminates need for custom authorization middleware. SDK is lightweight (~15KB).

**Alternatives considered:**
- Firebase RTDB: Higher vendor lock-in, Google data ownership concerns
- Cloudflare KV + Workers: Requires DIY auth, more moving parts
- Custom API: Maximum control but requires hosting, maintenance, and auth implementation

### 2. Full-state last-write-wins per key

**Choice:** Each sync key (`hidden`, `readlist`, `feedprefs`) is stored as a single JSONB blob with an `updated_at` timestamp. Newer timestamp wins entirely.

**Why:** Simplest correct approach for a small group with periodic sync. Conflicts (simultaneous edits on two devices between syncs) are extremely unlikely. Avoids complexity of operation logs, CRDTs, or tombstone-based merging.

**Alternatives considered:**
- Union merge: Correct for adds but breaks removals (unhidden items get re-hidden)
- Operation log: Correct merges but significant storage and complexity overhead
- Per-item timestamps: More granular but requires tracking metadata per article/feed

### 3. `useSyncedStorage` wrapper hook

**Choice:** Create a new `useSyncedStorage` hook that wraps `useLocalStorage`, rather than modifying `useLocalStorage` directly.

**Why:** `useLocalStorage` remains pure and unchanged — no risk of breaking existing behavior. `useSyncedStorage` adds sync-awareness as a layer: it writes to localStorage immediately (for instant UI response) and marks the key as dirty for the next sync cycle. Feature hooks swap one import. Non-synced keys (theme) continue using `useLocalStorage` directly.

### 4. Sync context with state machine

**Choice:** A `SyncProvider` context manages auth state, sync status, and the sync timer. Sync status follows a state machine: IDLE → SYNCING → SUCCESS (3s) → IDLE, or IDLE → SYNCING → ERROR → IDLE.

**Why:** Single source of truth for sync state consumed by both the nav icon and the settings page. The state machine prevents invalid transitions (e.g., starting a sync while one is in progress). The 3s success state enables the checkmark-to-cog animation.

### 5. Sync trigger: app open (>5min stale) + manual

**Choice:** On app mount, check `newsflash:last-synced` timestamp in localStorage. If >5 minutes old and user is authenticated, trigger sync. User can also press "Sync Now" in settings at any time.

**Why:** Avoids unnecessary API calls while keeping data reasonably fresh. 5-minute threshold means switching between tabs or brief navigation away won't trigger redundant syncs. Manual button gives users explicit control.

### 6. First login vs. returning device detection

**Choice:** Detection is implicit based on whether remote rows exist for the user. Zero rows = first login (push local). Rows exist = returning/new device (remote wins).

**Why:** No special flags or device registration needed. The behavior is naturally correct: a brand new user's local data becomes the seed; a user on a new device gets their synced state.

### 7. Nav icon animation

**Choice:** Settings nav item icon transitions: cog (idle) → spinner (syncing) → checkmark (success, 3s timeout) → cog. The settings page sync button mirrors the same states.

**Why:** Provides non-intrusive sync feedback without toast notifications or modals. The icon swap is subtle enough to not distract but visible enough to confirm sync happened.

## Risks / Trade-offs

- **Last-write-wins data loss:** If a user makes changes on two devices between syncs, the older device's changes are lost when the newer one syncs. → Mitigation: Acceptable for a small group. The 5-minute auto-sync window minimizes the risk. Manual "Sync Now" gives users control.

- **Feed prefs key mismatch across devices:** If devices have different connectors configured, syncing feed prefs may overwrite preferences for connectors not present on the syncing device. → Mitigation: Unknown keys are harmless (ignored by UI). Preferences for missing connectors are simply inert data.

- **Supabase free tier limits:** 500MB storage, 50K monthly active users. → Mitigation: Three small JSON rows per user means thousands of users fit easily. Not a concern for a small group.

- **Magic link email deliverability:** Supabase's built-in email sender has rate limits and may hit spam filters. → Mitigation: For a small group, the default sender is sufficient. Can configure custom SMTP later if needed.

- **Supabase SDK bundle size:** ~15KB gzipped added to the client bundle. → Mitigation: Lazy-load the Supabase client — only import when the user navigates to settings or when sync triggers. The auth session check on app mount can use a lightweight fetch to the Supabase REST API.

- **localStorage as sync timestamp store:** `newsflash:last-synced` is itself in localStorage, so clearing browser data resets the sync timer. → Mitigation: Worst case is an extra sync call on next app open — harmless.

## Supabase Schema

```sql
CREATE TABLE user_settings (
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  key        text NOT NULL,
  data       jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

## Module Structure

```
src/
├── lib/
│   └── supabase.ts                    # Supabase client (lazy-loaded)
├── hooks/
│   ├── use-local-storage.ts           # UNCHANGED
│   └── use-synced-storage.ts          # Wraps useLocalStorage + sync dirty tracking
├── features/
│   └── sync/
│       ├── sync-service.ts            # push/pull/merge logic, Supabase queries
│       ├── sync-context.tsx           # SyncProvider: auth state, sync status, timer
│       ├── sync-status.ts             # State machine types and transitions
│       └── components/
│           ├── sync-settings.tsx       # Auth section + sync controls on settings page
│           └── sync-nav-icon.tsx       # Animated cog/spinner/checkmark for nav
```

## Sync Algorithm (Pseudocode)

```
async function performSync(supabase, syncedKeys):
  remoteRows = await supabase.from("user_settings")
    .select("*").eq("user_id", currentUser.id)

  for each key in syncedKeys:
    localData = localStorage.get(key)
    localUpdatedAt = localStorage.get(key + ":updated_at")
    remoteRow = remoteRows.find(r => r.key === keyName)

    if remoteRow is null:
      // First login — push local
      await supabase.from("user_settings").upsert({
        user_id, key: keyName, data: localData, updated_at: localUpdatedAt
      })
    else if localUpdatedAt > remoteRow.updated_at:
      // Local is newer — push
      await supabase.from("user_settings").update({
        data: localData, updated_at: localUpdatedAt
      }).match({ user_id, key: keyName })
    else:
      // Remote is newer or equal — pull
      localStorage.set(key, remoteRow.data)
      localStorage.set(key + ":updated_at", remoteRow.updated_at)

  localStorage.set("newsflash:last-synced", now())
```

## Open Questions

- Should Supabase client initialization be fully lazy (dynamic import on first sync/auth action) or loaded at app startup? Lazy saves bundle size for unauthenticated users but adds latency to first sync.
- Should we show any indication to unauthenticated users that sync exists (e.g., a subtle "Sign in to sync" prompt), or keep it discoverable only through the settings page?
