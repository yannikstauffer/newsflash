## Context

The newsflash PWA uses Supabase for optional cross-device sync of local state (hidden articles, read list, feed preferences). Authentication is email-only and currently uses Supabase's magic link flow: the user submits their email, `supabase.auth.signInWithOtp({ email })` sends an email containing a link, and tapping the link opens the app and establishes a session.

This works on desktop browsers and Android PWAs. It does **not** work for iOS users who have installed the PWA to their home screen:

1. The PWA's WebView has its own storage partition, isolated from Safari's.
2. When the user taps the magic link in Mail, iOS opens it in Safari — not in the installed PWA.
3. The session callback lands in Safari's storage. The installed PWA never sees it.
4. iOS Universal Links cannot be registered to route to an installed PWA, so there is no way to intercept the link.

The app already depends on `@supabase/supabase-js`, which supports OTP verification via `verifyOtp({ email, token, type: "email" })`. The same Supabase endpoint that generates magic links also embeds a 6-digit token in the email — we just need to call `verifyOtp` instead of relying on link navigation, and update the email template to surface the token.

Current code under change: `src/features/sync/components/sync-settings.tsx` (the `UnauthenticatedView` component at lines 94-177).

## Goals / Non-Goals

**Goals:**
- Make sign-in work on iOS installed PWAs.
- Keep the entire sign-in flow inside the PWA window — never navigate out.
- Minimize code changes. Reuse the existing Supabase client, session listener, and sign-out flow.
- Preserve existing session persistence and auto-sync behavior.

**Non-Goals:**
- Passkeys / WebAuthn. Out of scope for this lightweight change; may be a follow-up.
- Password-based auth. Still explicitly unwanted.
- Magic link fallback for desktop. OTP works everywhere, so no fallback is needed.
- Rate limiting or lockout on failed OTP attempts beyond what Supabase enforces server-side.
- Changing how sessions are stored or refreshed.

## Decisions

### Decision 1: Use Supabase's built-in OTP (same endpoint), not a custom flow

Supabase's `signInWithOtp({ email })` already generates a 6-digit token and sends it in the confirmation email — the same email that contains the magic link. The token is valid for the same TTL as the link. We just need to:

1. Update the email template in the Supabase dashboard to prominently display `{{ .Token }}`.
2. Call `supabase.auth.verifyOtp({ email, token, type: "email" })` with the user-entered code to establish the session.

**Alternatives considered:**
- *Custom Edge Function + JWT*: Write a function to generate codes, email them, verify them, mint a Supabase JWT. Rejected — significantly more code, another moving part, and Supabase's built-in OTP is already wired up.
- *Twilio Verify / third-party OTP service*: Rejected — adds an external dependency and a second vendor for something Supabase already does.

### Decision 2: Two-step form inside `UnauthenticatedView`, not a new route

The existing `UnauthenticatedView` is a small form inside `SyncSettings`. Rather than introducing a new route or modal, we make the view stateful with two steps: `"email"` and `"code"`. The component already manages local form state (`email`, `error`, `sent`, `sending`); we replace `sent` with a `step` discriminator and add `code` state.

```
┌───────────────────────┐         ┌───────────────────────┐
│   step: "email"       │ submit  │   step: "code"        │
│   [email input]       │────────▶│   [6-digit input]     │
│   [Send code button]  │         │   [Verify button]     │
│                       │         │   [← Use different    │
│                       │         │      email]           │
└───────────────────────┘         └───────────┬───────────┘
                                              │ verifyOtp success
                                              ▼
                                  auth state listener fires,
                                  SyncContext flips to authenticated
```

**Alternatives considered:**
- *Separate route `/signin`*: Rejected — overkill for a two-step form, and it already lives inside the settings screen.
- *Modal dialog*: Rejected — the form is already inline in settings, no reason to change presentation.

### Decision 3: No local code validation beyond "6 digits"

The code is a 6-digit numeric token. We only check length and digit-ness client-side for input hygiene (`inputMode="numeric"`, `pattern="\d{6}"`, `maxLength={6}`). Actual validity is determined by `verifyOtp`, and any error (wrong code, expired code, too many attempts) maps to a single generic error message per the project's OWASP guideline to avoid leaking info.

**Alternatives considered:**
- *Auto-submit when 6 digits entered*: Deferred — nice-to-have, but adds complexity around paste handling and accidental submits. Keep an explicit "Verify" button for v1.

### Decision 4: Keep session establishment via the existing `onAuthStateChange` listener

`SyncProvider` already subscribes to `supabase.auth.onAuthStateChange` (sync-context.tsx:74) and reacts by setting `userEmail` / `userId`. A successful `verifyOtp` call fires a `SIGNED_IN` event through that listener, so the component only needs to call `verifyOtp` and handle the error case locally — the context handles the state flip. **No changes to `sync-context.tsx` are required.**

### Decision 5: Input attributes for mobile keyboard and autofill

The OTP input uses:
- `inputMode="numeric"` — numeric keypad on mobile
- `autoComplete="one-time-code"` — iOS/Android surface OTP codes from SMS/email in the keyboard bar (works for email OTP on recent iOS too)
- `pattern="\d{6}"` and `maxLength={6}` — browser-level validation
- `aria-label` with the localized "Verification code" string

## Risks / Trade-offs

- **Supabase email template must be updated manually** → Mitigation: tasks.md includes a manual step with the template snippet. The code change is safe to ship before the template is updated (users will still receive an email with the token in it — it just won't be prominent). Ship template update first, code second, to avoid confused users.
- **Users typing codes is slightly higher friction than tapping a link on desktop** → Accepted. Tapping was broken on iOS and that's the population we need to fix. Desktop users pay a small cost to make mobile users work at all.
- **`autocomplete="one-time-code"` support for email-delivered OTPs on iOS is best-effort** → Mitigation: the code is still entered manually if autofill misses; this is pure UX polish.
- **Existing e2e/unit tests for `UnauthenticatedView` will break** → Expected. Test updates are part of the task list and covered in the testing task.
- **Users with a sign-in in progress when the change ships will hit a dead end** (their magic link still works but the UI no longer expects it) → Mitigation: magic link callback handling never existed as custom code — it was handled by Supabase's default session detection, which will still fire on link click if they happen to click it in the same browser. Acceptable risk given the small surface.
