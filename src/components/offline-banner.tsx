import { WifiOff } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useOnlineStatus } from "@/hooks/use-online-status"

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const { t } = useTranslation()

  if (isOnline) {
    return null
  }

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-100 px-3 py-2 text-center text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      {t("offline.banner")}
    </div>
  )
}
