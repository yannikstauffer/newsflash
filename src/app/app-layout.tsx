import { Outlet } from "@tanstack/react-router"
import { Suspense } from "react"
import { useTranslation } from "react-i18next"

import { BottomNav } from "./components/bottom-nav"

import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/loading-spinner"
import { OfflineBanner } from "@/components/offline-banner"
import { Toaster } from "@/components/ui/sonner"
import { useArticleState } from "@/features/article-actions"
import { SyncProvider } from "@/features/sync/sync-context"
import { usePeriodicSync } from "@/hooks/use-periodic-sync"
import { useThemePreference } from "@/hooks/use-theme-preference"
import { cn } from "@/lib/utils"

const skipLinkClasses = cn(
  "sr-only focus:not-sr-only focus:absolute focus:z-50",
  "focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground",
  "focus:outline-2 focus:outline-offset-2 focus:outline-ring",
)

export function AppLayout() {
  const { t } = useTranslation()
  useThemePreference()
  usePeriodicSync()
  const { readListIds } = useArticleState()

  return (
    <SyncProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col pt-[env(safe-area-inset-top)]">
        {/* noinspection HtmlUnknownAnchorTarget - resolves to <main id="main-content"> below */}
        <a href="#main-content" className={skipLinkClasses}>
          {t("nav.skipToContent")}
        </a>
        <BottomNav readListCount={readListIds.length} />

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
