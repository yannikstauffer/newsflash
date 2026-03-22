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

  it("sets aria-current=page on Settings link at /settings", async () => {
    renderWithRouter("/settings")

    await waitFor(() => {
      const settingsLink = screen.getByRole("link", { name: /settings/i })
      expect(settingsLink).toHaveAttribute("aria-current", "page")
    })
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
