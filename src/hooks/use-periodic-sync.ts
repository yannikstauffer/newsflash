import { useEffect } from "react"

import { useIsStandalone } from "@/hooks/use-is-standalone"
import { registerPeriodicSync } from "@/lib/register-periodic-sync"

export function usePeriodicSync(): void {
  const isStandalone = useIsStandalone()

  useEffect(() => {
    if (!isStandalone) return
    registerPeriodicSync().catch(() => {})
  }, [isStandalone])
}
