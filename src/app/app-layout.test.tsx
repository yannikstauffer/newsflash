import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AppLayout } from "./app-layout"

function renderWithRouter() {
  const rootRoute = createRootRoute({ component: AppLayout })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div>{"Feed Content"}</div>,
  })
  const routeTree = rootRoute.addChildren([indexRoute])
  const memoryHistory = createMemoryHistory({ initialEntries: ["/"] })
  const testRouter = createRouter({ routeTree, history: memoryHistory })

  return render(<RouterProvider router={testRouter} />)
}

function mockMatchMedia(prefersDark: boolean) {
  globalThis.matchMedia = vi.fn((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof globalThis.matchMedia
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("dark")
  mockMatchMedia(false)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.classList.remove("dark")
  vi.restoreAllMocks()
})

describe("AppLayout", () => {
  it("renders a skip-to-content link targeting #main-content", async () => {
    renderWithRouter()

    const skipLink = await screen.findByText("Skip to content")

    expect(skipLink.tagName).toBe("A")
    expect(skipLink.getAttribute("href")).toBe("#main-content")
  })

  it("renders a main element with id main-content", async () => {
    renderWithRouter()

    await waitFor(() => {
      const mainElement = document.querySelector("#main-content")
      expect(mainElement).toBeInTheDocument()
      expect(mainElement?.tagName).toBe("MAIN")
    })
  })

  it("places skip link before the header in DOM order", async () => {
    renderWithRouter()

    const skipLink = await screen.findByText("Skip to content")
    const header = document.querySelector("header")

    expect(
      skipLink.compareDocumentPosition(header!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  describe("theme integration", () => {
    it("applies dark class when dark theme is stored in localStorage", async () => {
      localStorage.setItem("newsflash:theme", JSON.stringify("dark"))

      renderWithRouter()

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true)
      })
    })

    it("does not apply dark class when light theme is stored", async () => {
      localStorage.setItem("newsflash:theme", JSON.stringify("light"))

      renderWithRouter()

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(false)
      })
    })

    it("resolves system preference to dark when OS prefers dark", async () => {
      mockMatchMedia(true)
      localStorage.setItem("newsflash:theme", JSON.stringify("system"))

      renderWithRouter()

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true)
      })
    })

    it("applies theme on non-settings routes (feed page)", async () => {
      localStorage.setItem("newsflash:theme", JSON.stringify("dark"))

      renderWithRouter()

      await screen.findByText("Feed Content")
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    })
  })
})
