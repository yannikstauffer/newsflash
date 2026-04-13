import { useEffect, useState } from "react"

import { formatRelativeTime } from "../utils/format-time"

import { getLastSyncedAt, getLastSyncedAtSync } from "@/lib/sync-metadata"

interface FeedStatusRowProps {
  readonly lastRefreshedAt: Date | null
}

export function FeedStatusRow({ lastRefreshedAt }: FeedStatusRowProps) {
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(
    getLastSyncedAtSync,
  )

  useEffect(() => {
    getLastSyncedAt().then((date) => {
      if (date) setLastSyncedAt(date)
    })
  }, [lastRefreshedAt])

  const parts: string[] = []
  if (lastRefreshedAt) {
    parts.push(`Refreshed ${formatRelativeTime(lastRefreshedAt)}`)
  }
  if (lastSyncedAt) {
    parts.push(`Synced ${formatRelativeTime(lastSyncedAt)}`)
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
