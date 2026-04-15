import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { OverflowSheet } from "./overflow-sheet"

import { SyncProvider } from "@/features/sync/sync-context"

function renderWithRouter(initialPath = "/") {
  const rootRoute = createRootRoute({
    component: () => (
      <SyncProvider>
        <OverflowSheet />
      </SyncProvider>
    ),
  })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: () => <div /> })
  const insightsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/insights", component: () => <div /> })
  const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/settings", component: () => <div /> })
  const routeTree = rootRoute.addChildren([indexRoute, insightsRoute, settingsRoute])
  const history = createMemoryHistory({ initialEntries: [initialPath] })
  const testRouter = createRouter({ routeTree, history })
  return { router: testRouter, ...render(<RouterProvider router={testRouter} />) }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("OverflowSheet", () => {
  it("renders the overflow trigger button", async () => {
    renderWithRouter()
    expect(await screen.findByTestId("overflow-trigger")).toBeInTheDocument()
  })

  it("popup is not visible before trigger is clicked", async () => {
    renderWithRouter()
    await screen.findByTestId("overflow-trigger")
    expect(screen.queryByTestId("overflow-popup")).not.toBeInTheDocument()
  })

  it("popup becomes visible when trigger is clicked", async () => {
    renderWithRouter()
    const trigger = await screen.findByTestId("overflow-trigger")
    fireEvent.click(trigger)
    const popup = await screen.findByTestId("overflow-popup")
    expect(popup).toBeVisible()
  })

  it("shows Insights and Settings items in the popup", async () => {
    renderWithRouter()
    const trigger = await screen.findByTestId("overflow-trigger")
    fireEvent.click(trigger)
    expect(await screen.findByTestId("overflow-insights-item")).toBeInTheDocument()
    expect(await screen.findByTestId("overflow-settings-item")).toBeInTheDocument()
  })

  it("insights item has aria-current=page when on /insights route", async () => {
    renderWithRouter("/insights")
    const trigger = await screen.findByTestId("overflow-trigger")
    fireEvent.click(trigger)
    const insightsItem = await screen.findByTestId("overflow-insights-item")
    expect(insightsItem).toHaveAttribute("aria-current", "page")
  })

  it("settings item has aria-current=page when on /settings route", async () => {
    renderWithRouter("/settings")
    const trigger = await screen.findByTestId("overflow-trigger")
    fireEvent.click(trigger)
    const settingsItem = await screen.findByTestId("overflow-settings-item")
    expect(settingsItem).toHaveAttribute("aria-current", "page")
  })

  it("neither item has aria-current when on / route", async () => {
    renderWithRouter("/")
    const trigger = await screen.findByTestId("overflow-trigger")
    fireEvent.click(trigger)
    await screen.findByTestId("overflow-popup")
    expect(screen.getByTestId("overflow-insights-item")).not.toHaveAttribute("aria-current")
    expect(screen.getByTestId("overflow-settings-item")).not.toHaveAttribute("aria-current")
  })

  it("clicking settings item closes the popup and navigates", async () => {
    const { router } = renderWithRouter("/")
    const trigger = await screen.findByTestId("overflow-trigger")
    fireEvent.click(trigger)
    const settingsItem = await screen.findByTestId("overflow-settings-item")
    fireEvent.click(settingsItem)
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/settings")
    })
    await waitFor(() => {
      const popup = screen.queryByTestId("overflow-popup")
      expect(popup).not.toBeInTheDocument()
    })
  })

  it("clicking insights item navigates to /insights", async () => {
    const { router } = renderWithRouter("/")
    const trigger = await screen.findByTestId("overflow-trigger")
    fireEvent.click(trigger)
    const insightsItem = await screen.findByTestId("overflow-insights-item")
    fireEvent.click(insightsItem)
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/insights")
    })
  })
})
