import { Popover } from "@base-ui/react/popover"
import { Link, useLocation } from "@tanstack/react-router"
import { Check, Loader2, MoreVertical, Settings, TrendingUp } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useSyncContext } from "@/features/sync/sync-context"
import { cn } from "@/lib/utils"

interface OverflowButtonIconProps {
  readonly className?: string
}

function OverflowButtonIcon({ className }: OverflowButtonIconProps) {
  const { syncStatus, isAuthenticated } = useSyncContext()

  const showSyncing = isAuthenticated && syncStatus === "SYNCING"
  const showSuccess = isAuthenticated && syncStatus === "SUCCESS"

  return (
    <span className="relative inline-flex items-center justify-center">
      <MoreVertical className={className} aria-hidden="true" />
      {showSyncing && (
        <span
          className="absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-background"
          aria-hidden="true"
        >
          <Loader2 className="size-2.5 animate-spin text-muted-foreground" />
        </span>
      )}
      {showSuccess && (
        <span
          className="absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-background"
          aria-hidden="true"
        >
          <Check className="size-2.5 text-green-600" />
        </span>
      )}
    </span>
  )
}

export function OverflowSheet() {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isInsightsActive = location.pathname === "/insights"
  const isSettingsActive = location.pathname === "/settings"

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className="flex min-h-[48px] flex-1 items-center justify-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring text-muted-foreground hover:text-foreground"
        aria-label={t("nav.overflowOpen")}
        data-testid="overflow-trigger"
      >
        <span className="flex h-full w-full items-center justify-center gap-2 rounded-lg transition-colors">
          <OverflowButtonIcon className="size-4" />
          <span className="sr-only sm:not-sr-only">{t("nav.overflow")}</span>
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="top" align="end" sideOffset={8} className="z-50">
          <Popover.Popup
            className={cn(
              "min-w-[160px] overflow-hidden rounded-xl border border-border bg-background shadow-lg",
              "transition-[opacity,transform] duration-100 ease-in",
              "data-open:opacity-100 data-open:scale-100",
              "data-closed:opacity-0 data-closed:scale-95",
            )}
            data-testid="overflow-popup"
          >
            <Link
              to="/insights"
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                "hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isInsightsActive
                  ? "text-foreground bg-primary/10"
                  : "text-muted-foreground",
              )}
              aria-current={isInsightsActive ? "page" : undefined}
              data-testid="overflow-insights-item"
              onClick={() => setOpen(false)}
            >
              <TrendingUp className="size-4 shrink-0" aria-hidden="true" />
              {t("nav.insights")}
            </Link>

            <Link
              to="/settings"
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                "hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isSettingsActive
                  ? "text-foreground bg-primary/10"
                  : "text-muted-foreground",
              )}
              aria-current={isSettingsActive ? "page" : undefined}
              data-testid="overflow-settings-item"
              onClick={() => setOpen(false)}
            >
              <Settings className="size-4 shrink-0" aria-hidden="true" />
              {t("nav.settings")}
            </Link>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
