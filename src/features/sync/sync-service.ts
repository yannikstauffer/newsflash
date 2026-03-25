import type { SupabaseClient } from "@supabase/supabase-js"

export interface SyncedKeyConfig {
  readonly storageKey: string
  readonly remoteKey: string
}

export const SYNCED_KEYS: readonly SyncedKeyConfig[] = [
  { storageKey: "newsflash:hidden", remoteKey: "hidden" },
  { storageKey: "newsflash:readlist", remoteKey: "readlist" },
  { storageKey: "newsflash:feed-prefs", remoteKey: "feedprefs" },
]

const LAST_SYNCED_KEY = "newsflash:last-synced"

function getTimestampKey(storageKey: string): string {
  return `${storageKey}:updated_at`
}

function readLocalData(storageKey: string): unknown {
  try {
    const raw = globalThis.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readLocalTimestamp(storageKey: string): string | null {
  return globalThis.localStorage.getItem(getTimestampKey(storageKey))
}

function writeLocalData(storageKey: string, data: unknown, updatedAt: string): void {
  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(data))
    globalThis.localStorage.setItem(getTimestampKey(storageKey), updatedAt)
  } catch {
    // localStorage full or unavailable
  }
}

interface RemoteRow {
  readonly user_id: string
  readonly key: string
  readonly data: unknown
  readonly updated_at: string
}

export async function performSync(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data: remoteRows, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)

  if (error) {
    throw new Error(`Failed to fetch remote settings: ${error.message}`)
  }

  const remoteByKey = new Map<string, RemoteRow>()
  for (const row of (remoteRows ?? []) as RemoteRow[]) {
    remoteByKey.set(row.key, row)
  }

  for (const { storageKey, remoteKey } of SYNCED_KEYS) {
    const localData = readLocalData(storageKey)
    const localTimestamp = readLocalTimestamp(storageKey)
    const remoteRow = remoteByKey.get(remoteKey)

    if (!remoteRow) {
      // First login — push local to remote
      const { error: upsertError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          key: remoteKey,
          data: localData ?? getDefaultForKey(storageKey),
          updated_at: localTimestamp ?? new Date().toISOString(),
        })

      if (upsertError) {
        throw new Error(`Failed to push ${remoteKey}: ${upsertError.message}`)
      }
    } else if (localTimestamp && localTimestamp > remoteRow.updated_at) {
      // Local is newer — push to remote
      const { error: updateError } = await supabase
        .from("user_settings")
        .update({
          data: localData,
          updated_at: localTimestamp,
        })
        .match({ user_id: userId, key: remoteKey })

      if (updateError) {
        throw new Error(`Failed to update ${remoteKey}: ${updateError.message}`)
      }
    } else {
      // Remote is newer or equal, or no local timestamp — pull from remote
      writeLocalData(storageKey, remoteRow.data, remoteRow.updated_at)
    }
  }

  // Update last-synced timestamp
  try {
    globalThis.localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString())
  } catch {
    // localStorage unavailable
  }
}

function getDefaultForKey(storageKey: string): unknown {
  if (storageKey === "newsflash:feed-prefs") return {}
  return []
}

export function getLastSyncedTimestamp(): string | null {
  return globalThis.localStorage.getItem(LAST_SYNCED_KEY)
}

export function isSyncStale(thresholdMs: number = 5 * 60 * 1000): boolean {
  const lastSynced = getLastSyncedTimestamp()
  if (!lastSynced) return true

  const elapsed = Date.now() - new Date(lastSynced).getTime()
  return elapsed > thresholdMs
}
