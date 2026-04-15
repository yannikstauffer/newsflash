import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Navigate,
} from "@tanstack/react-router"
import { z } from "zod"

import { AppLayout } from "./app-layout"

import { FeedPage } from "@/features/feed/components/feed-page"

const rootRoute = createRootRoute({
  component: AppLayout,
})

function buildFeedSearchSchema() {
  return z.object({
    date: z.string().date().optional().catch(undefined),
    view: z.enum(["all"]).optional().catch(undefined),
    q: z.string().max(200).optional().catch(undefined),
    hidden: z.boolean().optional().catch(undefined),
  })
}

export const feedSearchSchema = buildFeedSearchSchema()

export type FeedSearch = z.infer<typeof feedSearchSchema>

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FeedPage,
  validateSearch: feedSearchSchema,
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

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/insights",
  component: lazyRouteComponent(
    () => import("@/features/insights/components/insights-page"),
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
  insightsRoute,
  notFoundRoute,
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
