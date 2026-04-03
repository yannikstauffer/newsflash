## ADDED Requirements

### Requirement: Error boundary catches runtime errors
The app SHALL include a React error boundary component that catches JavaScript runtime errors in its subtree and prevents the entire application from crashing to a white screen.

#### Scenario: Runtime error in a child component
- **WHEN** a child component throws an unhandled JavaScript error during rendering
- **THEN** the error boundary catches the error, the app does not crash to a white screen, and a fallback UI is displayed

#### Scenario: Error is logged to console
- **WHEN** the error boundary catches an error
- **THEN** the error and component stack are logged via `console.error`

### Requirement: Error boundary displays fallback UI
The error boundary SHALL render a user-friendly fallback UI when an error is caught. The fallback MUST include an error message indicating something went wrong and a "Reload" button that reloads the page.

#### Scenario: Fallback UI content
- **WHEN** the error boundary is in an error state
- **THEN** the fallback UI displays a message such as "Something went wrong" and a button labeled "Reload" that calls `window.location.reload()`

#### Scenario: Navigation remains visible during error
- **WHEN** an error is caught by the boundary
- **THEN** the app header and navigation tabs remain visible and functional because the boundary only wraps the `<main>` content area

### Requirement: Error boundary is placed in AppLayout
The `AppLayout` component SHALL wrap its `<main>` content children with the error boundary component so that navigation UI is preserved during errors.

#### Scenario: AppLayout integration
- **WHEN** `AppLayout` renders
- **THEN** the content inside `<main>` is wrapped by the error boundary component

### Requirement: Parse errors are logged
The `parseRss` function in `base-parser.ts` SHALL log XML parse errors to the console via `console.error` instead of silently returning an empty array. The log MUST include the source name and the error object.

#### Scenario: XML parse failure logging
- **WHEN** `parseRss` receives malformed XML that causes the parser to throw
- **THEN** the error is logged via `console.error` with the source name and error object, and the function returns an empty array

#### Scenario: Valid XML still parses successfully
- **WHEN** `parseRss` receives valid RSS or Atom XML
- **THEN** the function parses and returns normalized articles as before, with no console output
