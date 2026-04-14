import { Link } from "@tanstack/react-router"
import { Bookmark, Newspaper } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { ReactNode } from "react"

import { SyncNavIcon } from "@/features/sync/components/sync-nav-icon"

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

interface BottomNavProps {
  readonly readListCount: number
}

export function BottomNav({ readListCount }: BottomNavProps) {
  const { t } = useTranslation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:sticky sm:top-0 sm:z-20 sm:border-b sm:border-t-0 sm:pb-0"
      aria-label={t("nav.mainNavigation")}
    >
      <div className="mx-auto flex max-w-3xl gap-2 p-2">
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
              className="flex min-h-[48px] flex-1 items-center justify-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring text-muted-foreground hover:text-foreground [&.active]:text-foreground"
              activeProps={{ className: "active", "aria-current": "page" }}
              aria-label={ariaLabel}
            >
              <span className="flex h-full w-full items-center justify-center gap-2 rounded-lg transition-colors [.active>&]:bg-primary/10">
                <span className="relative" aria-hidden="true">
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
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
