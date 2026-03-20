# React UI Patterns

## Core Principles

1. **Never show stale UI** - Loading spinners only when actually loading
2. **Always surface errors** - Users must know when something fails
3. **Optimistic updates** - Make the UI feel instant
4. **Progressive disclosure** - Show content as it becomes available
5. **Graceful degradation** - Partial data is better than no data

## Loading State Patterns

### The Golden Rule

**Show loading indicator ONLY when there's no data to display.**

```typescript
// CORRECT - Only show loading when no data exists
const { data, isLoading, error } = useFetchItems()

if (error) return <ErrorMessage message="Failed to load items" onRetry={refetch} />
if (isLoading && !data) return <LoadingState />
if (!data?.length) return <EmptyState />

return <ItemList items={data} />
```

```typescript
// WRONG - Shows spinner even when we have cached data
if (isLoading) return <LoadingState /> // Flashes on refetch!
```

### Loading State Decision Tree

```
Is there an error?
  → Yes: Show error state with retry option
  → No: Continue

Is it loading AND we have no data?
  → Yes: Show loading indicator (spinner/skeleton)
  → No: Continue

Do we have data?
  → Yes, with items: Show the data
  → Yes, but empty: Show empty state
  → No: Show loading (fallback)
```

### Skeleton vs Spinner

| Use Skeleton When | Use Spinner When |
|-------------------|------------------|
| Known content shape | Unknown content shape |
| List/card layouts | Modal actions |
| Initial page load | Button submissions |
| Content placeholders | Inline operations |

## Button State Patterns

### Button Loading State

```tsx
import { Loader2 } from "lucide-react"

<Button
  onClick={handleSubmit}
  disabled={!isValid || isSubmitting}
>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

### Disable During Operations

**CRITICAL: Always disable triggers during async operations.**

```tsx
import { Loader2 } from "lucide-react"

// CORRECT - Button disabled while loading with spinner
<Button
  disabled={isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>

// WRONG - User can tap multiple times
<Button onClick={handleSubmit}>
  {isSubmitting ? "Submitting..." : "Submit"}
</Button>
```

## Empty States

### Empty State Requirements

Every list/collection MUST have an empty state:

```tsx
// WRONG - No empty state
return (
  <ul>
    {items.map((item) => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
)

// CORRECT - Explicit empty state
if (items.length === 0) {
  return <EmptyState />
}

return (
  <ul>
    {items.map((item) => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
)
```

### Contextual Empty States

```tsx
// Search with no results
<EmptyState
  icon="search"
  title="No results found"
  description="Try different search terms"
/>

// List with no items yet
<EmptyState
  icon="plus-circle"
  title="No items yet"
  description="Create your first item"
  action={{ label: "Create Item", onClick: handleCreate }}
/>
```

## Form Submission Pattern

```tsx
import { Loader2 } from "lucide-react"

function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      await apiClient("/items", {
        method: "POST",
        body: JSON.stringify(values),
      })
      // Handle success (e.g., navigate, show confirmation)
    } catch (submitError) {
      console.error("Submit failed:", submitError)
      setError("Failed to save. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form>
      {error && <ErrorMessage message={error} />}
      <input
        value={values.name}
        onChange={handleChange("name")}
      />
      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit
      </Button>
    </form>
  )
}
```

## Anti-Patterns

### Loading States

```typescript
// WRONG - Spinner when data exists (causes flash)
if (isLoading) return <Spinner />

// CORRECT - Only show loading without data
if (isLoading && !data) return <Spinner />
```

### Button States

```tsx
import { Loader2 } from "lucide-react"

// WRONG - Button not disabled during submission
<Button onClick={submit}>Submit</Button>

// CORRECT - Disabled and shows loading spinner
<Button onClick={submit} disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

## Checklist

Before completing any UI component:

**UI States:**
- [ ] Error state handled and shown to user (see [error-handling.md](error-handling.md))
- [ ] Loading state shown only when no data exists
- [ ] Empty state provided for collections
- [ ] Buttons disabled during async operations
- [ ] Buttons show loading indicator when appropriate

**Data & Mutations:**
- [ ] Async operations wrapped in try/catch
- [ ] Errors logged with `console.error` and surfaced to user
- [ ] All user actions have visual feedback
