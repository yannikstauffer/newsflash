## 1. Supabase email template (external config)

- [ ] 1.1 In the Supabase dashboard, update the "Magic Link" email template so `{{ .Token }}` is the primary, prominently displayed call-to-action (e.g. "Your verification code is **{{ .Token }}**"). The magic link itself can stay in the email body or be removed; it is no longer used.
- [ ] 1.2 Verify the token TTL in Supabase auth settings is acceptable (default is 1 hour) and document it in the sign-in view copy if needed.
- [ ] 1.3 Send a test email to confirm the code is visible and the email renders correctly on iOS Mail.

## 2. Sign-in component rewrite

- [ ] 2.1 In `src/features/sync/components/sync-settings.tsx`, replace the `sent` boolean state in `UnauthenticatedView` with a `step: "email" | "code"` discriminator, and add `code` string state.
- [ ] 2.2 Implement the email-submit handler: call `supabase.auth.signInWithOtp({ email })`, on success advance to `step: "code"`, on error show the generic send-error message.
- [ ] 2.3 Implement the code-submit handler: call `supabase.auth.verifyOtp({ email, token: code, type: "email" })`, on error show a single generic "invalid or expired code" message. On success, do nothing locally — the `SyncProvider` auth state listener will flip `isAuthenticated` and re-render.
- [ ] 2.4 Render the code-entry step with: a numeric input (`inputMode="numeric"`, `autoComplete="one-time-code"`, `pattern="\d{6}"`, `maxLength={6}`, localized `aria-label`), a "Verify" submit button, and a "Use a different email" button that resets state back to `step: "email"` and clears `code`.
- [ ] 2.5 Ensure both steps preserve mobile-first layout, 44x44 touch targets, visible focus outlines, and readonly props on any new interface types, per `docs/mobile-first.md`, `docs/wcag-accessibility.md`, and `docs/component-patterns.md`.
- [ ] 2.6 Remove the `EMAIL_REGEX` fallback only if it is superseded by stricter handling; otherwise keep it for the email step.

## 3. Internationalization

- [ ] 3.1 Update `src/locales/en.json` under the `sync` namespace: replace `magicLinkSent`, `sendMagicLink`, `sendError` (as needed) with OTP-flavored keys — e.g. `codeSent`, `enterCode`, `codeLabel`, `codePlaceholder`, `verifyCode`, `verifyError`, `useDifferentEmail`, `codeSentTo`. Keep `invalidEmail` and `emailLabel`.
- [ ] 3.2 Mirror every new/renamed key in `src/locales/de.json` with German translations.
- [ ] 3.3 Grep the codebase for any other references to removed keys (`magicLinkSent`, `sendMagicLink`) and update or remove them.

## 4. Unit tests

- [ ] 4.1 Update `src/features/sync/components/sync-settings.test.tsx`: remove assertions that target the "magic link sent" confirmation message and the `magic-link-sent` test id.
- [ ] 4.2 Add a test: submitting a valid email calls `signInWithOtp` and advances to the code-entry step (code input visible, verify button visible).
- [ ] 4.3 Add a test: submitting a 6-digit code calls `verifyOtp` with the expected `{ email, token, type: "email" }` payload.
- [ ] 4.4 Add a test: when `verifyOtp` returns an error, a generic error message is shown and the user stays on the code-entry step.
- [ ] 4.5 Add a test: clicking "Use a different email" returns the form to the email-entry step and clears the code input.
- [ ] 4.6 Add a test: email-step validation error still triggers for invalid email format and does NOT call `signInWithOtp`.
- [ ] 4.7 Verify mocking of `@/lib/supabase` covers `signInWithOtp` and `verifyOtp` without broken references in `src/lib/__tests__/supabase.test.ts` or `src/features/sync/sync-context.test.tsx`.

## 5. E2E test

- [ ] 5.1 Update or add a Playwright test in `tests-e2e/` that walks through the sign-in UI: fill email → expect code step → fill a mocked/test code → assert error handling path. If Supabase cannot be reliably hit in CI, stub the network layer or gate the test behind a test-only Supabase project, consistent with how existing sync e2e tests handle it.
- [ ] 5.2 Add an axe-core a11y assertion on the code-entry step (labels, focus order, contrast).

## 6. Quality Gates

- [ ] 6.1 Run `npm run lint` and fix any issues
- [ ] 6.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 6.3 Run `npm run test` and fix any issues
- [ ] 6.4 Run `npm run test:e2e` and fix any issues
- [ ] 6.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 6.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
