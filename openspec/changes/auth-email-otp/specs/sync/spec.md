## ADDED Requirements

### Requirement: Email OTP authentication
The application SHALL support authentication via an email-delivered one-time passcode (OTP). Users SHALL enter their email address, receive a 6-digit code by email, and enter that code in the application to establish a session. The entire flow SHALL remain inside the application window — no external navigation, no link clicking — so that it works reliably in installed PWAs on iOS where link callbacks from Mail open Safari instead of the installed app. No password-based authentication SHALL be offered.

#### Scenario: User requests an OTP code
- **WHEN** the user enters their email and submits the sign-in form
- **THEN** the application SHALL call Supabase `auth.signInWithOtp({ email })` and advance the form to the code-entry step

#### Scenario: User submits a valid code
- **WHEN** the user enters the 6-digit code from the email and submits
- **THEN** the application SHALL call Supabase `auth.verifyOtp({ email, token, type: "email" })` and an authenticated session SHALL be established

#### Scenario: User submits an invalid or expired code
- **WHEN** the user submits a code that Supabase rejects (wrong, expired, or too many attempts)
- **THEN** the application SHALL display a single generic error message without disclosing which failure mode occurred and SHALL keep the user on the code-entry step

#### Scenario: Invalid email format
- **WHEN** the user enters an invalid email format in step 1
- **THEN** the form SHALL display a validation error and SHALL NOT call the Supabase API

#### Scenario: User corrects a mistyped email
- **WHEN** the user is on the code-entry step and wants to use a different email address
- **THEN** the form SHALL provide an action to return to the email-entry step and SHALL clear any entered code

#### Scenario: Sign-in works in iOS installed PWA
- **WHEN** the user signs in while the app is installed to the iOS home screen and launched in standalone mode
- **THEN** the OTP flow SHALL complete entirely inside the PWA window and the user SHALL end up authenticated in the installed PWA (not in Safari)

## MODIFIED Requirements

### Requirement: Public signups enabled
Any user with a valid email address SHALL be able to create an account. No invite codes or admin approval SHALL be required.

#### Scenario: New user signs up
- **WHEN** a user who has never signed in enters their email
- **THEN** a new account SHALL be created and an OTP code SHALL be sent to that email

#### Scenario: Existing user signs in
- **WHEN** a user who already has an account enters their email
- **THEN** an OTP code SHALL be sent without creating a duplicate account

## REMOVED Requirements

### Requirement: Magic link authentication
**Reason**: Magic links are broken for iOS users who install the app as a PWA — tapping the link in Mail opens Safari rather than the installed PWA, so the session never reaches the app's storage partition. iOS Universal Links cannot be routed to installed PWAs, so there is no workaround. OTP keeps the entire flow inside the PWA window.
**Migration**: Replaced by the "Email OTP authentication" requirement in this capability. The same Supabase `signInWithOtp` endpoint is used; clients call `verifyOtp` with the user-entered 6-digit code instead of relying on magic-link callback navigation. The Supabase email template must be updated to prominently display `{{ .Token }}`.
