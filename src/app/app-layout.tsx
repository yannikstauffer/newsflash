import { Link, Outlet } from "@tanstack/react-router"
import { Bookmark, Newspaper, Settings } from "lucide-react"
import { Suspense } from "react"

import type { LucideIcon } from "lucide-react"

import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/loading-spinner"

interface NavItem {
  readonly to: string
  readonly label: string
  readonly icon: LucideIcon
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: "/", label: "Feed", icon: Newspaper },
  { to: "/read-list", label: "Read List", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
      >
        {"Skip to content"}
      </a>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring text-muted-foreground hover:text-foreground [&.active]:border-b-2 [&.active]:border-primary [&.active]:text-foreground"
              activeProps={{ "aria-current": "page" }}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </header>

      <main id="main-content" className="flex-1 p-3 md:p-6">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
