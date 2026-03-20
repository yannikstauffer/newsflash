import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Navigate,
} from "@tanstack/react-router"

import { AppLayout } from "./app-layout"

import { FeedPage } from "@/features/feed/components/feed-page"

const rootRoute = createRootRoute({
  component: AppLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FeedPage,
})

const readListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/read-list",
  component: lazyRouteComponent(
    () => import("@/features/article-actions/components/read-list-page"),
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: lazyRouteComponent(
    () => import("@/features/feed-config/components/feed-config-page"),
  ),
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: () => <Navigate to="/" />,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  readListRoute,
  settingsRoute,
  notFoundRoute,
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
