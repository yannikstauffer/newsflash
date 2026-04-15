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

function renderWithRouter(count: number, initialPath = "/") {
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
  const insightsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/insights",
    component: () => <div />,
  })
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: () => <div />,
  })
  const routeTree = rootRoute.addChildren([indexRoute, insightsRoute, settingsRoute])
  const history = createMemoryHistory({ initialEntries: [initialPath] })
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

  it("does NOT render a direct link to /settings", async () => {
    renderWithRouter(0)
    await screen.findByRole("navigation")
    const links = screen.queryAllByRole("link")
    const settingsLink = links.find((l) => l.getAttribute("href") === "/settings")
    expect(settingsLink).toBeUndefined()
  })

  it("renders the overflow trigger button instead of a settings link", async () => {
    renderWithRouter(0)
    expect(await screen.findByTestId("overflow-trigger")).toBeInTheDocument()
  })

  it("renders Feed and Read List nav links", async () => {
    renderWithRouter(0)
    await screen.findByRole("navigation")
    const links = screen.getAllByRole("link")
    const hrefs = links.map((l) => l.getAttribute("href"))
    expect(hrefs).toContain("/")
    expect(hrefs).toContain("/read-list")
  })
})
