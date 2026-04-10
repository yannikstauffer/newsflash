## Why

Magic link authentication is broken for users who install the app as a PWA on iOS. Tapping the link in Mail opens Safari (not the installed PWA), where Supabase establishes the session in an isolated storage partition that the standalone PWA can never read. iOS Universal Links do not route to installed PWAs, so there is no way to fix the existing flow — the link has to leave the app. Switching to an email OTP (6-digit code) keeps the entire sign-in flow inside the PWA window, fixing iOS while working identically everywhere else.

## What Changes

- **BREAKING**: Replace magic link sign-in with email OTP verification. The "check your email for a link" flow is removed entirely — no fallback is kept.
- Sign-in flow becomes two steps: (1) user enters email, app calls `supabase.auth.signInWithOtp({ email })`; (2) user enters the 6-digit code from the email, app calls `supabase.auth.verifyOtp({ email, token, type: "email" })` to establish the session.
- Update `UnauthenticatedView` in `sync-settings.tsx` to render an OTP input step after email submission, with a "use a different email" affordance to go back.
- Supabase email template must be updated (outside the repo, via Supabase dashboard) to surface `{{ .Token }}` prominently. The link is no longer the primary call-to-action.
- Update i18n strings (`en.json`, `de.json`) to replace magic-link copy with OTP copy.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `sync`: The `auth.md` capability is changing — the "Magic link authentication" requirement is replaced with an "Email OTP authentication" requirement covering the two-step code-entry flow.

## Impact

- **Code**: `src/features/sync/components/sync-settings.tsx` (UnauthenticatedView rewrite), `src/features/sync/components/sync-settings.test.tsx`, `src/locales/en.json`, `src/locales/de.json`.
- **Specs**: `openspec/specs/sync/auth.md` requirements are updated via a delta in this change.
- **External config**: Supabase email template must be updated in the Supabase dashboard to show the OTP token. This is a manual step, tracked in tasks.md.
- **No backend changes**: same Supabase project, same `signInWithOtp` endpoint, just adding the `verifyOtp` call.
- **No dependency changes**: `@supabase/supabase-js` already supports `verifyOtp`.
- **Users**: Anyone currently mid-sign-in when the change ships will need to request a new code. Existing sessions are unaffected — session persistence is unchanged.
