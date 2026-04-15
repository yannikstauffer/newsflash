import type { DayStats, StatsStore } from "@/features/stats/stats-store"
import type { SupabaseClient } from "@supabase/supabase-js"

import { parseStatsStore } from "@/features/stats/stats-store"
import { dispatchSyncEvent } from "@/hooks/use-local-storage"

export interface SyncedKeyConfig {
  readonly storageKey: string
  readonly remoteKey: string
  readonly additiveMerge?: true
}

const STATS_SNAPSHOT_KEY = "newsflash:stats:synced-snapshot"

export const SYNCED_KEYS: readonly SyncedKeyConfig[] = [
  { storageKey: "newsflash:hidden", remoteKey: "hidden" },
  { storageKey: "newsflash:readlist", remoteKey: "readlist" },
  { storageKey: "newsflash:feed-prefs", remoteKey: "feedprefs" },
  { storageKey: "newsflash:filter-prefs", remoteKey: "filterprefs" },
  { storageKey: "newsflash:stats", remoteKey: "stats", additiveMerge: true },
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

// --- Stats snapshot helpers (never synced) ---

export function readStatsSnapshot(): StatsStore | null {
  try {
    const raw = globalThis.localStorage.getItem(STATS_SNAPSHOT_KEY)
    if (!raw) return null
    // parseStatsStore sanitizes day bucket shapes (sources/filters present and non-null)
    // so computeStatsDelta can safely index into snapshotDay.sources/filters
    return parseStatsStore(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeStatsSnapshot(store: StatsStore): void {
  try {
    globalThis.localStorage.setItem(STATS_SNAPSHOT_KEY, JSON.stringify(store))
  } catch {
    // localStorage full or unavailable
  }
}

// --- Additive merge helpers ---

interface CounterRecord { appeared: number; hidden: number; saved: number }

function deltaCounter(
  current: CounterRecord | undefined,
  snapshot: CounterRecord | undefined,
): CounterRecord {
  return {
    appeared: Math.max(0, (current?.appeared ?? 0) - (snapshot?.appeared ?? 0)),
    hidden: Math.max(0, (current?.hidden ?? 0) - (snapshot?.hidden ?? 0)),
    saved: Math.max(0, (current?.saved ?? 0) - (snapshot?.saved ?? 0)),
  }
}

function addCounters(base: CounterRecord | undefined, delta: CounterRecord): CounterRecord {
  return {
    appeared: (base?.appeared ?? 0) + delta.appeared,
    hidden: (base?.hidden ?? 0) + delta.hidden,
    saved: (base?.saved ?? 0) + delta.saved,
  }
}

export function computeStatsDelta(current: StatsStore, snapshot: StatsStore | null): StatsStore {
  const delta: StatsStore = { version: 1, days: {} }

  for (const [date, currentDay] of Object.entries(current.days)) {
    const snapshotDay = snapshot?.days[date]
    const sourceDelta: DayStats["sources"] = {}
    const filterDelta: DayStats["filters"] = {}

    const allSources = new Set([
      ...Object.keys(currentDay.sources),
      ...Object.keys(snapshotDay?.sources ?? {}),
    ])
    for (const sourceId of allSources) {
      const d = deltaCounter(
        // eslint-disable-next-line security/detect-object-injection
        currentDay.sources[sourceId],
        // eslint-disable-next-line security/detect-object-injection
        snapshotDay?.sources?.[sourceId],
      )
      if (d.appeared > 0 || d.hidden > 0 || d.saved > 0) {
        // eslint-disable-next-line security/detect-object-injection
        sourceDelta[sourceId] = d
      }
    }

    const allFilters = new Set([
      ...Object.keys(currentDay.filters),
      ...Object.keys(snapshotDay?.filters ?? {}),
    ])
    for (const filterId of allFilters) {
      const d = deltaCounter(
        // eslint-disable-next-line security/detect-object-injection
        currentDay.filters[filterId],
        // eslint-disable-next-line security/detect-object-injection
        snapshotDay?.filters?.[filterId],
      )
      if (d.appeared > 0 || d.hidden > 0 || d.saved > 0) {
        // eslint-disable-next-line security/detect-object-injection
        filterDelta[filterId] = d
      }
    }

    if (Object.keys(sourceDelta).length > 0 || Object.keys(filterDelta).length > 0) {
      // eslint-disable-next-line security/detect-object-injection
      delta.days[date] = { sources: sourceDelta, filters: filterDelta }
    }
  }

  return delta
}

export function mergeStats(remote: StatsStore | null, delta: StatsStore): StatsStore {
  const merged: StatsStore = { version: 1, days: { ...remote?.days } }

  for (const [date, deltaDay] of Object.entries(delta.days)) {
    // eslint-disable-next-line security/detect-object-injection
    if (merged.days[date] === undefined) {
      // eslint-disable-next-line security/detect-object-injection
      merged.days[date] = { sources: {}, filters: {} }
    }
    // eslint-disable-next-line security/detect-object-injection
    const mergedDay = merged.days[date]

    for (const [sourceId, deltaStats] of Object.entries(deltaDay.sources)) {
      // eslint-disable-next-line security/detect-object-injection
      mergedDay.sources[sourceId] = addCounters(mergedDay.sources[sourceId], deltaStats)
    }

    for (const [filterId, deltaStats] of Object.entries(deltaDay.filters)) {
      // eslint-disable-next-line security/detect-object-injection
      mergedDay.filters[filterId] = addCounters(mergedDay.filters[filterId], deltaStats)
    }
  }

  return merged
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

  for (const { storageKey, remoteKey, additiveMerge } of SYNCED_KEYS) {
    const remoteRow = remoteByKey.get(remoteKey)

    if (additiveMerge) {
      // Additive merge path for stats key
      const { readStats, writeStats, parseStatsStore } = await import("@/features/stats/stats-store")
      const current = readStats()
      const snapshot = readStatsSnapshot()
      const delta = computeStatsDelta(current, snapshot)
      // Validate remote data — treat malformed payloads as null (no remote)
      const remoteStats = remoteRow ? parseStatsStore(remoteRow.data) : null
      const isDeltaEmpty = Object.keys(delta.days).length === 0

      if (isDeltaEmpty) {
        // No local changes since last sync — just pull remote (or keep local if no remote row)
        const resolved = remoteStats ?? current
        // writeStats applies 90-day eviction; read back the evicted version for the snapshot
        writeStats(resolved)
        const evictedResolved = readStats()
        writeStatsSnapshot(evictedResolved)
        dispatchSyncEvent(storageKey)
        continue
      }

      const merged = mergeStats(remoteStats, delta)
      // Write locally first so writeStats applies the 90-day eviction, then push the
      // evicted version to Supabase to prevent the remote row from growing without bound.
      writeStats(merged)
      const evicted = readStats()
      const now = new Date().toISOString()

      if (remoteRow) {
        const { error: updateError } = await supabase
          .from("user_settings")
          .update({ data: evicted, updated_at: now })
          .match({ user_id: userId, key: remoteKey })
        if (updateError) {
          throw new Error(`Failed to update ${remoteKey}: ${updateError.message}`)
        }
      } else {
        const { error: upsertError } = await supabase
          .from("user_settings")
          .upsert({ user_id: userId, key: remoteKey, data: evicted, updated_at: now })
        if (upsertError) {
          throw new Error(`Failed to push ${remoteKey}: ${upsertError.message}`)
        }
      }

      writeStatsSnapshot(evicted)
      dispatchSyncEvent(storageKey)
      continue
    }

    const localData = readLocalData(storageKey)
    const localTimestamp = readLocalTimestamp(storageKey)

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
      dispatchSyncEvent(storageKey)
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
  if (storageKey === "newsflash:filter-prefs") return {}
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
