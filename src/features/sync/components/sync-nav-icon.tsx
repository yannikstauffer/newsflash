import { Check, Loader2, Settings } from "lucide-react"

import { useSyncContext } from "../sync-context"

import { cn } from "@/lib/utils"

interface SyncNavIconProps {
  readonly className?: string
}

export function SyncNavIcon({ className }: SyncNavIconProps) {
  const { syncStatus, isAuthenticated } = useSyncContext()

  if (!isAuthenticated || syncStatus === "IDLE" || syncStatus === "ERROR") {
    return <Settings className={className} aria-hidden="true" />
  }

  if (syncStatus === "SYNCING") {
    return <Loader2 className={cn(className, "animate-spin")} aria-hidden="true" />
  }

  if (syncStatus === "SUCCESS") {
    return <Check className={className} aria-hidden="true" />
  }

  return <Settings className={className} aria-hidden="true" />
}
