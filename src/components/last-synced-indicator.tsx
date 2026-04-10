import { useEffect, useState } from "react"

import { getLastSyncedAt } from "@/lib/sync-metadata"

function formatRelativeSyncTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffMinutes < 1) return "just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

export function LastSyncedIndicator() {
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  useEffect(() => {
    getLastSyncedAt()
      .then(setLastSyncedAt)
      .catch(() => {})
  }, [])

  if (!lastSyncedAt) return null

  return (
    <p
      className="text-center text-xs text-muted-foreground"
      aria-label="Last background sync"
    >
      {`Synced ${formatRelativeSyncTime(lastSyncedAt)}`}
    </p>
  )
}
