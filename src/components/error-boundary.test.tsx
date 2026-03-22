import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ErrorBoundary } from "./error-boundary"

function ThrowingChild(): never {
  throw new Error("Test error")
}

function GoodChild() {
  // eslint-disable-next-line i18next/no-literal-string
  return <p>All good</p>
}

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText("All good")).toBeDefined()
  })

  it("renders fallback UI when a child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Something went wrong")).toBeDefined()
    expect(screen.getByRole("button", { name: "Reload" })).toBeDefined()
    expect(screen.getByRole("alert")).toBeDefined()

    consoleSpy.mockRestore()
  })

  it("logs the error to console.error", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    )

    consoleSpy.mockRestore()
  })
})
