import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { BottomNav } from "./bottom-nav"

import { SyncProvider } from "@/features/sync/sync-context"

function renderWithRouter(count: number) {
  const rootRoute = createRootRoute({
    component: () => (
      <SyncProvider>
        <BottomNav readListCount={count} />
      </SyncProvider>
    ),
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div />,
  })
  const routeTree = rootRoute.addChildren([indexRoute])
  const history = createMemoryHistory({ initialEntries: ["/"] })
  const testRouter = createRouter({ routeTree, history })
  return render(<RouterProvider router={testRouter} />)
}

afterEach(() => {
  cleanup()
})

describe("BottomNav", () => {
  it("renders the main navigation landmark", async () => {
    renderWithRouter(0)
    const nav = await screen.findByRole("navigation")
    expect(nav).toBeInTheDocument()
  })

  it("does not show badge when count is 0", async () => {
    renderWithRouter(0)
    await screen.findByRole("navigation")
    expect(screen.queryByTestId("read-list-badge")).not.toBeInTheDocument()
  })

  it("shows numeric badge for counts under 100", async () => {
    renderWithRouter(5)
    expect((await screen.findByTestId("read-list-badge")).textContent).toBe("5")
  })

  it("shows 99+ badge when count exceeds 99", async () => {
    renderWithRouter(150)
    expect((await screen.findByTestId("read-list-badge")).textContent).toBe("99+")
  })
})
