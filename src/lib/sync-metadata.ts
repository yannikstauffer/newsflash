import { openDB } from "idb"

import type { IDBPDatabase } from "idb"

const DB_NAME = "newsflash-sync"
const DB_VERSION = 1
const STORE_NAME = "metadata"
const LAST_SYNCED_KEY = "last-synced"
const FEED_PREFS_KEY = "feed-preferences"
const LS_LAST_SYNCED_KEY = "newsflash:last-synced-at"

interface SyncMetadataDB {
  readonly metadata: {
    readonly key: string
    readonly value: { readonly key: string; readonly value: unknown }
  }
}

let databasePromise: Promise<IDBPDatabase<SyncMetadataDB> | undefined> | undefined

function openDatabase(): Promise<IDBPDatabase<SyncMetadataDB> | undefined> {
  if (!databasePromise) {
    try {
      databasePromise = openDB<SyncMetadataDB>(DB_NAME, DB_VERSION, {
        upgrade(database) {
          database.createObjectStore(STORE_NAME, { keyPath: "key" })
        },
      }).catch(() => {
        databasePromise = undefined
        return undefined
      })
    } catch {
      databasePromise = undefined
      return Promise.resolve(undefined)
    }
  }
  return databasePromise
}

export function getLastSyncedAtSync(): Date | null {
  try {
    const raw = localStorage.getItem(LS_LAST_SYNCED_KEY)
    if (!raw) return null
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

export async function setLastSyncedAt(timestamp: Date): Promise<void> {
  try {
    localStorage.setItem(LS_LAST_SYNCED_KEY, timestamp.toISOString())
  } catch {
    // localStorage unavailable — continue with IDB write
  }
  const database = await openDatabase()
  if (!database) return
  await database.put(STORE_NAME, {
    key: LAST_SYNCED_KEY,
    value: timestamp.toISOString(),
  })
}

export async function getLastSyncedAt(): Promise<Date | null> {
  const database = await openDatabase()
  if (!database) return null
  const entry = await database.get(STORE_NAME, LAST_SYNCED_KEY)
  if (!entry?.value) return null
  return new Date(entry.value as string)
}

export async function setFeedPreferences(
  preferences: Record<string, boolean>,
): Promise<void> {
  const database = await openDatabase()
  if (!database) return
  await database.put(STORE_NAME, {
    key: FEED_PREFS_KEY,
    value: preferences,
  })
}

export async function getFeedPreferences(): Promise<Record<string, boolean> | null> {
  const database = await openDatabase()
  if (!database) return null
  const entry = await database.get(STORE_NAME, FEED_PREFS_KEY)
  if (!entry?.value) return null
  return entry.value as Record<string, boolean>
}
