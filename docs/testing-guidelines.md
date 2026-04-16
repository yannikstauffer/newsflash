# Testing Guidelines

This project uses **Vitest** for unit/integration tests and **Playwright** for end-to-end tests. Target **80%+ code coverage** for new code.

## Test Location

Colocate tests with source files:

```
src/
  lib/
    utils.ts
    __tests__/
      utils.test.ts
  features/
    auth/
      use-auth.ts
      __tests__/
        use-auth.test.ts
tests-e2e/
  auth.spec.ts
```

## Vitest — Unit and Integration Tests

### Test Structure

Use `describe` / `it` blocks with clear descriptions. Follow given/when/then flow.

```typescript
import { describe, it, expect } from "vitest"

import { formatCurrency } from "../format-currency"

describe("formatCurrency", () => {
  it("should format positive amounts with two decimal places", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50")
  })

  it("should format zero as $0.00", () => {
    expect(formatCurrency(0)).toBe("$0.00")
  })

  it("should handle negative amounts", () => {
    expect(formatCurrency(-99.9)).toBe("-$99.90")
  })

  it("should throw on NaN input", () => {
    expect(() => formatCurrency(NaN)).toThrow("Invalid amount")
  })
})
```

### Edge Cases

Always include edge cases. Cover boundaries, empty inputs, and unexpected types.

```typescript
describe("parseSearchQuery", () => {
  // Happy path
  it("should parse a simple search term", () => {
    expect(parseSearchQuery("hello")).toEqual({ terms: ["hello"] })
  })

  // Edge cases
  it("should return empty terms for empty string", () => {
    expect(parseSearchQuery("")).toEqual({ terms: [] })
  })

  it("should return empty terms for whitespace-only input", () => {
    expect(parseSearchQuery("   ")).toEqual({ terms: [] })
  })

  it("should trim and deduplicate terms", () => {
    expect(parseSearchQuery(" hello  hello world ")).toEqual({
      terms: ["hello", "world"],
    })
  })

  it("should handle max length input", () => {
    const longInput = "a".repeat(1000)
    expect(() => parseSearchQuery(longInput)).not.toThrow()
  })
})
```

### Parameterized Tests

Use `it.each` for testing multiple scenarios with the same logic.

```typescript
describe("isValidEmail", () => {
  it.each([
    ["user@example.com", true],
    ["user+tag@example.co.uk", true],
    ["invalid", false],
    ["@missing-local.com", false],
    ["missing-domain@", false],
    ["", false],
  ])("should return %s for input '%s'", (input, expected) => {
    expect(isValidEmail(input)).toBe(expected)
  })
})
```

### Testing Hooks

Use `@testing-library/react` to test custom hooks.

```typescript
import { renderHook, act } from "@testing-library/react"
import { describe, it, expect } from "vitest"

import { useCounter } from "../use-counter"

describe("useCounter", () => {
  it("should initialize with default value", () => {
    const { result } = renderHook(() => useCounter(0))
    expect(result.current.count).toBe(0)
  })

  it("should increment the count", () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

### Testing Components

Use `@testing-library/react` with `fireEvent` for interactions. **Do not use `@testing-library/user-event`** — it is not in `devDependencies` and cannot be reliably resolved by Vite in tests.

```typescript
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

import { LoginForm } from "../login-form"

describe("LoginForm", () => {
  it("should call onSubmit with email and password", async () => {
    const onSubmit = vi.fn()

    render(<LoginForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } })
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    })
  })

  it("should show validation error for invalid email", async () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } })
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.getByRole("alert")).toHaveTextContent("valid email")
  })
})
```

### Mocking

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

import { fetchUser } from "../api"
import { getUserProfile } from "../get-user-profile"

vi.mock("../api")

describe("getUserProfile", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should return formatted user profile", async () => {
    vi.mocked(fetchUser).mockResolvedValue({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
    })

    const profile = await getUserProfile(1)

    expect(profile).toEqual({
      displayName: "Alice",
      email: "alice@example.com",
    })
    expect(fetchUser).toHaveBeenCalledWith(1)
  })

  it("should throw when user not found", async () => {
    vi.mocked(fetchUser).mockRejectedValue(new Error("Not found"))

    await expect(getUserProfile(999)).rejects.toThrow("Not found")
  })
})
```

## What to Test

| Category | Test? | Notes |
|----------|-------|-------|
| Utility functions | Yes | Pure functions, data transformations |
| Custom hooks | Yes | State logic, side effects |
| Business logic | Yes | Validation, calculations, data mapping |
| Components with logic | Yes | Forms, conditional rendering, interactions |
| Simple presentational components | No | Just rendering props, no logic |
| Third-party library wrappers | No | Trust the library's own tests |

## Playwright — End-to-End Tests

E2E tests live in `tests-e2e/` and verify full user flows.

```typescript
import { test, expect } from "@playwright/test"

test("user can log in and see dashboard", async ({ page }) => {
  await page.goto("/login")

  await page.getByLabel("Email").fill("user@example.com")
  await page.getByLabel("Password").fill("password123")
  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page).toHaveURL("/dashboard")
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
})

test("shows error for invalid credentials", async ({ page }) => {
  await page.goto("/login")

  await page.getByLabel("Email").fill("wrong@example.com")
  await page.getByLabel("Password").fill("wrong")
  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page.getByRole("alert")).toContainText("Invalid credentials")
})
```

### Accessibility audits in E2E

```typescript
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test("home page has no accessibility violations", async ({ page }) => {
  await page.goto("/")

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()

  expect(results.violations).toEqual([])
})
```

## Coverage

- **Target:** 80%+ coverage for new code
- **Run:** `npm test --coverage`
- **Focus on:** business logic, utilities, hooks, and interactive components
- **Don't chase 100%** on trivial code — coverage should reflect meaningful test quality

## Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run a specific test file
npm test -- src/lib/__tests__/utils.test.ts

# Run E2E tests
npx playwright test

# Run E2E tests with UI
npx playwright test --ui
```
