# React Component Patterns

Guidelines for building components in this Vite + React 19 SPA.

## Component Naming

- **PascalCase** for components: `UserProfile`, `ArticleCard`
- **camelCase** for utilities: `formatDate`, `calculateTotal`
- **kebab-case** for files: `user-profile.tsx`, `article-card.tsx`

## Lazy Loading and Code Splitting

Since this is a client-rendered SPA, use `React.lazy()` and `Suspense` to split the bundle and load heavy components on demand.

```tsx
import { lazy, Suspense } from "react"

// Lazy load heavy or below-the-fold components
const HeavyChart = lazy(() => import("./heavy-chart"))
const AdminPanel = lazy(() => import("../features/admin/admin-panel"))

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}
```

### When to use lazy loading

- Route-level components (each page/route)
- Heavy third-party libraries (charts, editors, maps)
- Features behind feature flags or permissions
- Below-the-fold content not needed at initial render

### When NOT to lazy load

- Small, frequently used UI components (buttons, inputs)
- Components needed for above-the-fold content
- Components that are part of the critical rendering path

## Route-Level Code Splitting

Split at the route level so each page loads only what it needs.

```tsx
import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const Home = lazy(() => import("./pages/home"))
const About = lazy(() => import("./pages/about"))
const Settings = lazy(() => import("./pages/settings"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

## Read-Only Props (CRITICAL)

All component prop interfaces **must** use the `readonly` modifier on every property. This enforces immutability, prevents accidental mutation, and enables React rendering optimizations.

```tsx
// Good — all properties marked readonly
interface CardProps {
  readonly children: React.ReactNode
  readonly title: string
  readonly onClick?: () => void
}

// Bad — mutable props
interface CardProps {
  children: React.ReactNode
  title: string
  onClick?: () => void
}
```

This applies to all prop definitions: `interface`, `type`, and inline types used as component parameters.

## Composition Over Inheritance

Prefer composition patterns. Never use class inheritance for component reuse.

### Children pattern

```tsx
interface CardProps {
  readonly children: React.ReactNode
  readonly className?: string
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      {children}
    </div>
  )
}

// Usage
<Card className="bg-blue-50">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Render prop / slot pattern

```tsx
interface ListProps<T> {
  readonly items: T[]
  readonly renderItem: (item: T, index: number) => React.ReactNode
  readonly emptyState?: React.ReactNode
}

function List<T>({ items, renderItem, emptyState }: ListProps<T>) {
  if (items.length === 0) {
    return <>{emptyState ?? <p>No items</p>}</>
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}
```

### Compound component pattern

```tsx
interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext value={{ activeTab, setActiveTab }}>
      <div role="tablist">{children}</div>
    </TabsContext>
  )
}

function TabTrigger({ value, children }: TabTriggerProps) {
  const { activeTab, setActiveTab } = use(TabsContext)!

  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

function TabContent({ value, children }: TabContentProps) {
  const { activeTab } = use(TabsContext)!
  if (activeTab !== value) return null
  return <div role="tabpanel">{children}</div>
}

// Usage
<Tabs defaultTab="general">
  <TabTrigger value="general">General</TabTrigger>
  <TabTrigger value="security">Security</TabTrigger>
  <TabContent value="general">General settings...</TabContent>
  <TabContent value="security">Security settings...</TabContent>
</Tabs>
```

## Custom Hooks for Logic Extraction

Extract reusable logic into custom hooks. Keep components focused on rendering.

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Usage in component
function SearchInput() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      searchApi(debouncedQuery)
    }
  }, [debouncedQuery])

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

## Module Boundaries

The project enforces strict architectural boundaries:

```
pages (app) --> features --> shared modules
     |              |
     v              v
     OK             Cannot import from pages
     OK             Both can import from shared
```

**Shared modules** (`components/`, `hooks/`, `lib/`, `types/`, `utils/`) must remain pure and cannot import from `features/` or page-level code.

### Import restrictions

- Features **cannot** import from pages/app
- Shared modules **cannot** import from features or pages/app
- Pages/app **can** import from anywhere
- Features **can** import from shared modules

## Import Order

Imports are sorted by ESLint. Follow this order:

```typescript
import { readFile } from "node:fs/promises"       // 1. Node.js builtins
import { useState } from "react"                   // 2. External packages
import { cn } from "@/utils/css-utils"             // 3. Internal imports (@/*)
import { Component } from "../component"           // 4. Parent imports
import { helper } from "./helper"                  // 5. Sibling imports
import type { Props } from "./types"               // 6. Type imports
```

## Performance

### React Compiler

React Compiler is enabled. Guidelines:

- **Avoid impure functions in render** — No `Math.random()`, `Date.now()` in render logic
- **Use `useState` for random values** — Initialize with `useState(() => Math.random())`
- **Memoization is automatic** — No need for manual `useMemo` / `useCallback` in most cases

### Bundle size

- Keep client-side JavaScript minimal
- Lazy load heavy components with `React.lazy()`
- Use responsive images with `width` / `height` attributes and `loading="lazy"`
- Audit bundle with `npx vite-bundle-visualizer`
