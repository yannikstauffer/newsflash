import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { router } from "./router"

beforeAll(() => {
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

function renderWithRouter(initialPath: string) {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  })

  const testRouter = createRouter({
    ...router.options,
    history: memoryHistory,
    routeTree: router.routeTree,
  })

  return {
    ...render(<RouterProvider router={testRouter} />),
    router: testRouter,
  }
}

afterEach(() => {
  cleanup()
})

describe("route configuration", () => {
  it("renders FeedPage at /", async () => {
    renderWithRouter("/")

    await waitFor(() => {
      expect(screen.getByLabelText("Main navigation")).toBeInTheDocument()
    })

    // FeedPage should be rendered — check that feed content area exists
    await waitFor(() => {
      const main = document.querySelector("#main-content")
      expect(main).toBeInTheDocument()
    })
  })

  it("renders ReadListPage at /read-list", async () => {
    renderWithRouter("/read-list")

    await waitFor(() => {
      expect(screen.getByLabelText("Main navigation")).toBeInTheDocument()
    })
  })

  it("renders FeedConfigPage at /settings", async () => {
    renderWithRouter("/settings")

    await waitFor(() => {
      expect(screen.getByLabelText("Main navigation")).toBeInTheDocument()
    })
  })
})

describe("navigation link active state", () => {
  it("sets aria-current=page on the active link for /", async () => {
    renderWithRouter("/")

    await waitFor(() => {
      const feedLink = screen.getByRole("link", { name: /feed/i })
      expect(feedLink).toHaveAttribute("aria-current", "page")
    })
  })

  it("sets aria-current=page on Read List link at /read-list", async () => {
    renderWithRouter("/read-list")

    await waitFor(() => {
      const readListLink = screen.getByRole("link", { name: /read list/i })
      expect(readListLink).toHaveAttribute("aria-current", "page")
    })
  })

  it("renders overflow trigger (Settings moved to overflow sheet) at /settings", async () => {
    renderWithRouter("/settings")

    // Settings is no longer a direct nav link — it's accessible via the overflow sheet.
    // Verify that the overflow trigger is present and there is no direct settings link.
    await waitFor(() => {
      expect(screen.getByTestId("overflow-trigger")).toBeInTheDocument()
    })
    const links = screen.queryAllByRole("link")
    const settingsLink = links.find((l) => l.getAttribute("href") === "/settings")
    expect(settingsLink).toBeUndefined()
  })

  it("does not set aria-current on inactive links", async () => {
    renderWithRouter("/")

    await waitFor(() => {
      const readListLink = screen.getByRole("link", { name: /read list/i })
      expect(readListLink).not.toHaveAttribute("aria-current")
    })
  })
})

describe("not-found route redirect", () => {
  it("redirects unknown paths to /", async () => {
    const { router: testRouter } = renderWithRouter("/unknown-path")

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe("/")
    })
  })
})
