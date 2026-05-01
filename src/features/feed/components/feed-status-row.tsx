import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { formatRelativeTime } from "../utils/format-time"

import { getLastSyncedAt, getLastSyncedAtSync } from "@/lib/sync-metadata"

interface FeedStatusRowProps {
  readonly lastRefreshedAt: Date | null
}

export function FeedStatusRow({ lastRefreshedAt }: FeedStatusRowProps) {
  const { t, i18n } = useTranslation()
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(
    getLastSyncedAtSync,
  )

  useEffect(() => {
    let isActive = true

    void (async () => {
      try {
        const date = await getLastSyncedAt()
        if (isActive) {
          setLastSyncedAt(date)
        }
      } catch {
        // Ignore IndexedDB read failures and keep the current cached value.
      }
    })()

    return () => {
      isActive = false
    }
  }, [lastRefreshedAt])

  const parts: string[] = []
  if (lastRefreshedAt) {
    parts.push(t("feed.refreshed", { time: formatRelativeTime(lastRefreshedAt, undefined, i18n.language) }))
  }
  if (lastSyncedAt) {
    parts.push(t("feed.synced", { time: formatRelativeTime(lastSyncedAt, undefined, i18n.language) }))
  }

  return (
    <p
      className="min-h-5 text-center text-xs text-muted-foreground"
      aria-label="Feed status"
    >
      {parts.length > 0 ? parts.join(" \u00B7 ") : null}
    </p>
  )
}
