## 1. Supabase Setup

- [x] 1.1 Install `@supabase/supabase-js` npm dependency
- [x] 1.2 Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` and document in `.env.example`
- [x] 1.3 Create `src/lib/supabase.ts` with lazy-loaded Supabase client (dynamic import pattern)
- [x] 1.4 Create Supabase project and configure: enable magic link auth, disable password auth, enable public signups, create `user_settings` table with RLS policies (SQL from design.md)
- [x] 1.5 Write unit tests for the Supabase client lazy-loading behavior

## 2. Sync Engine Core

- [x] 2.1 Create `src/features/sync/sync-status.ts` — sync status state machine types and transition logic (IDLE, SYNCING, SUCCESS, ERROR)
- [x] 2.2 Write unit tests for sync status state machine transitions
- [x] 2.3 Create `src/features/sync/sync-service.ts` — push/pull/compare logic per key, first-login detection, last-write-wins resolution
- [x] 2.4 Write unit tests for sync-service: first login (push local), returning device (pull remote), ongoing sync (timestamp comparison), sync failure handling
- [x] 2.5 Create `src/hooks/use-synced-storage.ts` — wraps `useLocalStorage`, adds companion `<key>:updated_at` timestamp tracking on writes
- [x] 2.6 Write unit tests for `useSyncedStorage`: verify localStorage writes update companion timestamp, verify it delegates to `useLocalStorage` correctly

## 3. Sync Context

- [x] 3.1 Create `src/features/sync/sync-context.tsx` — `SyncProvider` managing auth state, sync status, auto-sync on mount (>5min staleness check), manual sync trigger, `newsflash:last-synced` tracking
- [x] 3.2 Write unit tests for `SyncProvider`: auto-sync trigger with stale timestamp, skip sync when fresh, skip when unauthenticated, manual sync always runs
- [x] 3.3 Integrate `SyncProvider` into the app component tree (wrap at app root level)

## 4. Auth UI

- [x] 4.1 Create `src/features/sync/components/sync-settings.tsx` — settings page section with two states: unauthenticated (email input + "Send magic link" button + description) and authenticated (email display + "Last synced" + "Sync Now" button + "Sign Out" button)
- [x] 4.2 Implement magic link form: email validation, call `auth.signInWithOtp`, show confirmation message
- [x] 4.3 Implement sign-out action via sync context
- [x] 4.4 Write unit tests for sync-settings component: renders auth form when unauthenticated, renders sync controls when authenticated, email validation, sign-out flow
- [x] 4.5 Integrate sync-settings section into the existing settings page

## 5. Sync Status UI

- [x] 5.1 Create `src/features/sync/components/sync-nav-icon.tsx` — animated icon component that switches between cog (IDLE), spinner (SYNCING), and checkmark (SUCCESS) based on sync status from context
- [x] 5.2 Write unit tests for sync-nav-icon: correct icon per state, checkmark returns to cog after 3s, unauthenticated always shows cog
- [x] 5.3 Implement "Sync Now" button state transitions in sync-settings: enabled "Sync Now" (IDLE), disabled "Syncing..." with spinner (SYNCING), "Synced" with checkmark (SUCCESS, 3s)
- [x] 5.4 Implement "Last synced: X ago" relative timestamp display in sync-settings
- [x] 5.5 Integrate sync-nav-icon into the settings navigation item, replacing the static cog icon

## 6. Hook Migration

- [x] 6.1 Update `src/features/article-actions/hooks/use-article-state.ts` to use `useSyncedStorage` instead of `useLocalStorage` for `newsflash:hidden` and `newsflash:readlist` keys
- [x] 6.2 Update `src/features/feed-config/hooks/use-feed-preferences.ts` to use `useSyncedStorage` instead of `useLocalStorage` for `newsflash:feed-prefs` key
- [x] 6.3 Verify existing unit tests for `useArticleState` and `useFeedPreferences` still pass with `useSyncedStorage`
- [x] 6.4 Write additional unit tests verifying that `useSyncedStorage` companion timestamps are updated when article state or feed preferences change

## 7. E2E Testing

- [x] 7.1 Write e2e test: unauthenticated user sees auth form on settings page, no sync controls visible
- [x] 7.2 Write e2e test: settings page displays sync section structure (email input, send button, description text)
- [x] 7.3 Write e2e test: settings nav icon is a cog when unauthenticated

## 8. Quality Gates

- [x] 8.1 Run `npm run lint` and fix any issues
- [x] 8.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 8.3 Run `npm run test` and fix any issues
- [x] 8.4 Run `npm run test:e2e` and fix any issues
- [x] 8.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 8.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
