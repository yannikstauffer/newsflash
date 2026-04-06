import { openDB } from "idb"

import type { NormalizedArticle } from "@/features/connectors/types"
import type { IDBPDatabase } from "idb"

const DB_NAME = "newsflash-articles"
const DB_VERSION = 1
const STORE_NAME = "articles"
const DEFAULT_MAX_AGE_DAYS = 14

export interface CachedArticle extends NormalizedArticle {
  readonly pinned: boolean
  readonly pinnedKey: 0 | 1
  readonly cachedAt: Date
}

interface ArticleCacheDB {
  readonly articles: {
    readonly key: string
    readonly value: CachedArticle
    readonly indexes: {
      readonly publishedAt: Date
      readonly source: string
      readonly pinnedKey: 0 | 1
    }
  }
}

let databasePromise: Promise<IDBPDatabase<ArticleCacheDB> | undefined>
  | undefined

function openDatabase(): Promise<IDBPDatabase<ArticleCacheDB> | undefined> {
  if (!databasePromise) {
    try {
      databasePromise = openDB<ArticleCacheDB>(DB_NAME, DB_VERSION, {
        upgrade(database) {
          const store = database.createObjectStore(STORE_NAME, {
            keyPath: "id",
          })
          store.createIndex("publishedAt", "publishedAt")
          store.createIndex("source", "source")
          store.createIndex("pinnedKey", "pinnedKey")
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

function toCachedArticle(
  article: NormalizedArticle,
  existing?: CachedArticle,
): CachedArticle {
  const pinned = existing?.pinned ?? false
  return {
    ...article,
    pinned,
    pinnedKey: pinned ? 1 : 0,
    cachedAt: existing?.cachedAt ?? new Date(),
  }
}

function toNormalizedArticle(cached: CachedArticle): NormalizedArticle {
  const {
    pinned: _pinned,
    pinnedKey: _pinnedKey,
    cachedAt: _cachedAt,
    ...article
  } = cached
  return article
}

export async function upsertMany(
  articles: readonly NormalizedArticle[],
): Promise<void> {
  const database = await openDatabase()
  if (!database) return

  const tx = database.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)

  const uniqueIds = [...new Set(articles.map((article) => article.id))]
  const existingEntries = await Promise.all(
    uniqueIds.map(async (id) => [id, await store.get(id)] as const),
  )
  const existingById = new Map<string, CachedArticle | undefined>(
    existingEntries,
  )
  const finalById = new Map<string, CachedArticle>()

  for (const article of articles) {
    const existing =
      finalById.get(article.id) ?? existingById.get(article.id)
    finalById.set(article.id, toCachedArticle(article, existing))
  }

  await Promise.all(
    [...finalById.values()].map((cachedArticle) =>
      store.put(cachedArticle),
    ),
  )

  await tx.done
  await evict()
}

export async function getAll(): Promise<NormalizedArticle[]> {
  const database = await openDatabase()
  if (!database) return []

  const all = await database.getAll(STORE_NAME)
  return all.map(toNormalizedArticle)
}

export async function getByDateRange(
  start: Date,
  end: Date,
): Promise<NormalizedArticle[]> {
  const database = await openDatabase()
  if (!database) return []

  const range = IDBKeyRange.bound(start, end)
  const results = await database.getAllFromIndex(
    STORE_NAME,
    "publishedAt",
    range,
  )
  return results.map(toNormalizedArticle)
}

export async function setPinned(
  id: string,
  pinned: boolean,
): Promise<void> {
  const database = await openDatabase()
  if (!database) return

  const article = await database.get(STORE_NAME, id)
  if (!article) return

  await database.put(STORE_NAME, {
    ...article,
    pinned,
    pinnedKey: pinned ? 1 : 0,
  })
}

/** @internal Reset module state — test-only */
export async function _resetForTesting(): Promise<void> {
  if (databasePromise) {
    const database = await databasePromise.catch(() => undefined)
    database?.close()
  }
  databasePromise = undefined
}

export async function evict(
  maxAgeDays: number = DEFAULT_MAX_AGE_DAYS,
): Promise<void> {
  const database = await openDatabase()
  if (!database) return

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - maxAgeDays)

  const range = IDBKeyRange.upperBound(cutoff, true)
  const tx = database.transaction(STORE_NAME, "readwrite")
  const index = tx.objectStore(STORE_NAME).index("publishedAt")

  let cursor = await index.openCursor(range)
  while (cursor) {
    if (!cursor.value.pinned) {
      await cursor.delete()
    }
    cursor = await cursor.continue()
  }

  await tx.done
}
