## ADDED Requirements

### Requirement: Supabase client initialization
The application SHALL initialize a Supabase client using environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The client module SHALL be lazy-loaded (dynamic import) to avoid adding to the initial bundle for unauthenticated users.

#### Scenario: Client created with environment variables
- **WHEN** the Supabase client is first accessed
- **THEN** it SHALL be initialized with the URL and anon key from `import.meta.env`

#### Scenario: Client is lazily loaded
- **WHEN** the application loads for an unauthenticated user who never accesses sync features
- **THEN** the Supabase SDK SHALL NOT be included in the initial JavaScript bundle

### Requirement: Magic link authentication
The application SHALL support authentication via Supabase magic link (email only). Users SHALL enter their email address and receive a one-time login link. No password-based authentication SHALL be offered.

#### Scenario: User requests magic link
- **WHEN** the user enters their email and submits the sign-in form
- **THEN** the application SHALL call Supabase `auth.signInWithOtp({ email })` and display a confirmation message

#### Scenario: User clicks magic link
- **WHEN** the user clicks the magic link in their email
- **THEN** the application SHALL establish an authenticated session and redirect to the app

#### Scenario: Invalid email format
- **WHEN** the user enters an invalid email format
- **THEN** the form SHALL display a validation error and SHALL NOT call the Supabase API

### Requirement: Session persistence
Authenticated sessions SHALL persist across page refreshes using Supabase's built-in session management (refresh tokens in localStorage). The application SHALL check for an existing session on mount.

#### Scenario: Session survives page refresh
- **WHEN** an authenticated user refreshes the page
- **THEN** the user SHALL remain authenticated without re-entering credentials

#### Scenario: Session expiry
- **WHEN** the session refresh token expires or is invalidated
- **THEN** the user SHALL be treated as unauthenticated and sync features SHALL be disabled

### Requirement: Sign out
The application SHALL provide a sign-out action that clears the Supabase session. Signing out SHALL NOT delete local data — localStorage settings SHALL remain intact.

#### Scenario: User signs out
- **WHEN** the user clicks "Sign Out"
- **THEN** the Supabase session SHALL be cleared and the sync UI SHALL return to the unauthenticated state

#### Scenario: Local data preserved after sign out
- **WHEN** the user signs out
- **THEN** all localStorage data (hidden articles, read list, feed preferences) SHALL remain unchanged

### Requirement: Public signups enabled
Any user with a valid email address SHALL be able to create an account. No invite codes or admin approval SHALL be required.

#### Scenario: New user signs up
- **WHEN** a user who has never signed in enters their email
- **THEN** a new account SHALL be created and a magic link SHALL be sent

#### Scenario: Existing user signs in
- **WHEN** a user who already has an account enters their email
- **THEN** a magic link SHALL be sent without creating a duplicate account
