# Error Handling Patterns

Consistent error handling across the application. Never expose internal details to users. Log for debugging, show generic messages to users.

## Client-Side Errors

### Try/Catch for async operations

```typescript
try {
  const result = await riskyOperation()
} catch (error) {
  console.error("Operation failed:", error)
  // Handle gracefully — show fallback UI or error message
}
```

### Error Boundaries

Use React error boundaries to catch rendering errors and prevent the entire app from crashing.

```tsx
import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={<div>Something went wrong. Please refresh.</div>}>
  <App />
</ErrorBoundary>
```

Wrap error boundaries at multiple levels:

- **App level** — Catches catastrophic errors, shows generic error page
- **Route level** — Catches page-specific errors without losing navigation
- **Feature level** — Isolates feature failures from the rest of the page

## API Error Handling

### Fetch with error handling

```typescript
interface ApiError {
  message: string
  status: number
}

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`API error ${response.status}:`, errorBody)
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}
```

### Centralized API client

```typescript
const API_BASE = import.meta.env.VITE_API_URL

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json() as Promise<T>
  } catch (error) {
    console.error(`API call failed [${endpoint}]:`, error)
    throw error // Re-throw for caller to handle
  }
}

// Usage
try {
  const users = await apiClient<User[]>("/users")
} catch {
  // Show error state in UI
  setError("Failed to load users")
}
```

### Retry logic for transient failures

```typescript
async function fetchWithRetry<T>(
  url: string,
  retries = 3,
  delay = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json() as Promise<T>
    } catch (error) {
      if (attempt === retries) throw error
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }

  throw new Error("Unreachable")
}
```

## Error Display Hierarchy

Choose the right error presentation based on severity and context:

```
1. Inline error (field-level) → Form validation errors
2. Toast notification → Recoverable errors, user can retry
3. Error banner → Page-level errors, data still partially usable
4. Full error screen → Unrecoverable, needs user action
```

## Never Swallow Errors Silently

**CRITICAL: Every failed operation must give the user visible feedback.**

```typescript
// CORRECT - Error logged and surfaced to user
try {
  await apiClient("/items", { method: "POST", body: JSON.stringify(data) })
} catch (error) {
  console.error("createItem failed:", error)
  setError("Failed to create item")
}

// WRONG - Error silently caught, user has no idea
try {
  await apiClient("/items", { method: "POST", body: JSON.stringify(data) })
} catch (error) {
  console.error(error) // User sees nothing!
}
```

## Error States in Components

### Loading / error / data pattern

```tsx
interface AsyncState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

function UserList() {
  const [state, setState] = useState<AsyncState<User[]>>({
    data: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    fetchData<User[]>("/api/users")
      .then((data) => setState({ data, error: null, isLoading: false }))
      .catch(() =>
        setState({ data: null, error: "Failed to load users", isLoading: false }),
      )
  }, [])

  if (state.isLoading) return <Spinner />
  if (state.error) return <ErrorMessage message={state.error} />
  if (!state.data) return null

  return (
    <ul>
      {state.data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### Error message component

```tsx
interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-red-600 underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}
```

## Rules

- **Never** show raw error messages to users (may contain stack traces, DB info, file paths)
- **Always** log the full error for debugging via `console.error`
- **Always** show a user-friendly generic message
- **Provide retry** when the operation can reasonably succeed on a second attempt
- **Use error boundaries** to prevent cascading UI failures
- **Handle all promise rejections** — unhandled rejections crash the app in strict mode
