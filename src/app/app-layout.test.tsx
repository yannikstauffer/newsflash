import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

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

afterEach(() => {
  cleanup()
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
})
