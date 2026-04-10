import { Link, Outlet } from "@tanstack/react-router"
import { Bookmark, Newspaper } from "lucide-react"
import { Suspense } from "react"
import { useTranslation } from "react-i18next"

import type { ReactNode } from "react"

import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/loading-spinner"
import { OfflineBanner } from "@/components/offline-banner"
import { Toaster } from "@/components/ui/sonner"
import { useArticleState } from "@/features/article-actions"
import { SyncNavIcon } from "@/features/sync/components/sync-nav-icon"
import { SyncProvider } from "@/features/sync/sync-context"
import { usePeriodicSync } from "@/hooks/use-periodic-sync"
import { useThemePreference } from "@/hooks/use-theme-preference"

interface NavItem {
  readonly to: string
  readonly labelKey: string
  readonly icon: ({ className }: { readonly className?: string }) => ReactNode
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: "/", labelKey: "nav.feed", icon: Newspaper },
  { to: "/read-list", labelKey: "nav.readList", icon: Bookmark },
  { to: "/settings", labelKey: "nav.settings", icon: SyncNavIcon },
]

function formatBadgeCount(count: number): string {
  return count > 99 ? "99+" : String(count)
}

export function AppLayout() {
  const { t } = useTranslation()
  useThemePreference()
  usePeriodicSync()
  const { readListIds } = useArticleState()
  const readListCount = readListIds.length

  return (
    <SyncProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        {/* noinspection HtmlUnknownAnchorTarget - resolves to <main id="main-content"> below */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
        >
          {t("nav.skipToContent")}
        </a>
        <nav
          className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:sticky sm:top-0 sm:border-b sm:border-t-0 sm:pb-0"
          aria-label={t("nav.mainNavigation")}
        >
          <div className="mx-auto flex max-w-3xl">
            {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => {
              const label = t(labelKey)
              const isReadList = to === "/read-list"
              const ariaLabel =
                isReadList && readListCount > 0
                  ? t("nav.readListCount", { label, count: readListCount })
                  : undefined

              return (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: true, includeSearch: false }}
                  className="flex min-h-[48px] flex-1 items-center justify-center gap-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring text-muted-foreground hover:text-foreground [&.active]:border-t-2 [&.active]:border-primary [&.active]:text-foreground sm:[&.active]:border-b-2 sm:[&.active]:border-t-0"
                  activeProps={{ "aria-current": "page" }}
                  aria-label={ariaLabel}
                >
                  <span className="relative">
                    <Icon className="size-4" />
                    {isReadList && readListCount > 0 && (
                      <span
                        className="absolute -right-2.5 -top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium leading-[18px] text-muted-foreground"
                        aria-hidden="true"
                        data-testid="read-list-badge"
                      >
                        {formatBadgeCount(readListCount)}
                      </span>
                    )}
                  </span>
                  <span className="sr-only sm:not-sr-only">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <OfflineBanner />

        <main id="main-content" className="flex-1 p-3 pb-16 sm:pb-0 md:p-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>

        <Toaster />
      </div>
    </SyncProvider>
  )
}
