## Why

User settings (read list, hidden articles, feed preferences) are stored only in localStorage, making them device-local. For a small group of users accessing Newsflash from multiple devices (phone, desktop, tablet), curated content and preferences are lost or divergent. Cross-device sync eliminates the need to re-configure feeds or re-build a read list on each device.

## What Changes

- Add Supabase as a backend for persisting user settings (free tier)
- Add magic link (email) authentication — no passwords, public signups
- Sync three localStorage keys across devices: hidden articles, read list, feed preferences
- Theme preference remains device-local (not synced)
- Sync triggers: on app open if last sync >5 min ago, or manual "Sync Now" in settings
- First login (no remote data): local state seeds remote
- New device (remote data exists): remote wins, overwrites local
- Ongoing: last-write-wins by `updated_at` timestamp per key
- Settings nav icon animates through states: cog → spinner (syncing) → checkmark (3s) → cog
- Settings page shows auth section, sync status, "Last synced" timestamp, and "Sync Now" button

## Capabilities

### New Capabilities
- `supabase-auth`: Magic link email authentication via Supabase, session management, sign-in/sign-out flows
- `settings-sync`: Cross-device sync engine — periodic and on-demand sync of localStorage keys to Supabase, conflict resolution (last-write-wins), offline-first behavior
- `sync-ui`: Sync-related UI components — settings page auth/sync section, nav icon state animation (cog/spinner/checkmark), sync status display

### Modified Capabilities
- `feed-configuration`: Feed preferences storage switches from `useLocalStorage` to `useSyncedStorage` to participate in cross-device sync
- `article-actions`: Hidden articles and read list storage switch from `useLocalStorage` to `useSyncedStorage` to participate in cross-device sync

## Impact

- **New dependency**: `@supabase/supabase-js` npm package (~15KB)
- **New environment variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Modified hooks**: `useArticleState` and `useFeedPreferences` change storage hook
- **New module**: `src/features/sync/` (service, context, components)
- **New library**: `src/lib/supabase.ts` (client initialization)
- **External dependency**: Supabase project (free tier) — requires initial setup outside the codebase
- **No breaking changes**: App works fully offline without authentication; sync is purely additive
