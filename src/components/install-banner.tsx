import { Download, Share, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useInstallPrompt } from "@/hooks/use-install-prompt"

export function InstallBanner() {
  const { canInstall, isIosSafari, isDismissed, triggerInstall, dismiss } =
    useInstallPrompt()
  const { t } = useTranslation()

  if (isDismissed) return null
  if (!canInstall && !isIosSafari) return null

  return (
    <div
      role="banner"
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
    >
      <Download className="size-5 shrink-0 text-primary" aria-hidden="true" />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {canInstall ? (
          <>
            <span className="truncate text-sm text-foreground">
              {t("install.bannerMessage")}
            </span>
            <button
              type="button"
              onClick={triggerInstall}
              className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("install.installButton")}
            </button>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-foreground">
            <Share className="size-4 shrink-0" aria-hidden="true" />
            {t("install.iosInstructions")}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t("install.dismissLabel")}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
