import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

import { performSync, SYNCED_KEYS } from "./sync-service"
import { transitionSyncStatus } from "./sync-status"

import type { SyncStatus } from "./sync-status"
import type { LocalStorageSyncDetail } from "@/hooks/use-local-storage"
import type { ReactNode } from "react"

const LOCAL_STORAGE_SYNC_EVENT = "newsflash:local-storage-sync"

interface SyncContextValue {
  readonly syncStatus: SyncStatus
  readonly userEmail: string | null
  readonly isAuthenticated: boolean
  readonly triggerSync: () => void
  readonly signOut: () => Promise<void>
}

const SyncContext = createContext<SyncContextValue>({
  syncStatus: "IDLE",
  userEmail: null,
  isAuthenticated: false,
  triggerSync: () => {},
  signOut: async () => {},
})

const RESET_TIMEOUT_MS = 3000
const DEBOUNCE_DELAY_MS = 5000

const SYNCED_STORAGE_KEYS = new Set(SYNCED_KEYS.map((k) => k.storageKey))

interface SyncProviderProps {
  readonly children: ReactNode
}

export function SyncProvider({ children }: SyncProviderProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("IDLE")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)
  const isSyncingRef = useRef(false)

  // Check for existing Supabase session on mount
  useEffect(() => {
    isMountedRef.current = true

    async function checkSession() {
      try {
        const { getSupabaseClient } = await import("@/lib/supabase")
        const supabase = await getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user && isMountedRef.current) {
          setUserEmail(session.user.email ?? null)
          setUserId(session.user.id)
        }
      } catch {
        // Supabase not configured or unavailable — stay unauthenticated
      }
    }

    checkSession()

    // Listen for auth state changes
    let unsubscribe: (() => void) | undefined

    async function setupAuthListener() {
      try {
        const { getSupabaseClient } = await import("@/lib/supabase")
        const supabase = await getSupabaseClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!isMountedRef.current) return
          if (session?.user) {
            setUserEmail(session.user.email ?? null)
            setUserId(session.user.id)
          } else {
            setUserEmail(null)
            setUserId(null)
          }
        })
        unsubscribe = () => subscription.unsubscribe()
      } catch {
        // Supabase not configured
      }
    }

    setupAuthListener()

    return () => {
      isMountedRef.current = false
      unsubscribe?.()
    }
  }, [])

  const doSync = useCallback(async () => {
    if (!userId) return

    isSyncingRef.current = true
    setSyncStatus((current) => transitionSyncStatus(current, "START"))

    try {
      const { getSupabaseClient } = await import("@/lib/supabase")
      const supabase = await getSupabaseClient()
      await performSync(supabase, userId)

      if (!isMountedRef.current) return
      setSyncStatus((current) => transitionSyncStatus(current, "COMPLETE"))
    } catch (error) {
      console.error("Sync failed:", error)
      if (!isMountedRef.current) return
      setSyncStatus((current) => transitionSyncStatus(current, "FAIL"))
    } finally {
      isSyncingRef.current = false
    }

    // Reset to IDLE after timeout
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }
    resetTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setSyncStatus((current) => transitionSyncStatus(current, "RESET"))
      }
    }, RESET_TIMEOUT_MS)
  }, [userId])

  // Auto-sync on mount when authenticated
  useEffect(() => {
    if (userId) {
      doSync()
    }
  }, [userId, doSync])

  // Debounced sync-on-write: listen for synced key changes
  useEffect(() => {
    function handleSyncEvent(event: Event) {
      const detail = (event as CustomEvent<LocalStorageSyncDetail>).detail
      if (!SYNCED_STORAGE_KEYS.has(detail.key)) return
      if (!userId) return
      if (isSyncingRef.current) return

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        doSync()
      }, DEBOUNCE_DELAY_MS)
    }

    globalThis.window?.addEventListener(LOCAL_STORAGE_SYNC_EVENT, handleSyncEvent)
    return () => {
      globalThis.window?.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, handleSyncEvent)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [userId, doSync])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const triggerSync = useCallback(() => {
    if (syncStatus === "SYNCING") return
    // Cancel pending debounced sync — manual sync covers it
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    doSync()
  }, [syncStatus, doSync])

  const signOut = useCallback(async () => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase")
      const supabase = await getSupabaseClient()
      await supabase.auth.signOut()
      setUserEmail(null)
      setUserId(null)
      setSyncStatus("IDLE")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }, [])

  const value: SyncContextValue = {
    syncStatus,
    userEmail,
    isAuthenticated: userId !== null,
    triggerSync,
    signOut,
  }

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook co-located with provider intentionally
export function useSyncContext(): SyncContextValue {
  return useContext(SyncContext)
}
