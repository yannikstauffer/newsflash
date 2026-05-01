import { useCallback, useMemo } from "react"

import type { NormalizedArticle } from "@/features/connectors/types"

import { useSyncedStorage } from "@/hooks/use-synced-storage"
import * as articleCache from "@/lib/article-cache"

export const HIDDEN_TTL_DAYS = 14
export const MAX_READLIST_ITEMS = 200

const HIDDEN_KEY = "newsflash:hidden"
const READLIST_KEY = "newsflash:readlist"
const HIDDEN_TTL_MS = HIDDEN_TTL_DAYS * 24 * 60 * 60 * 1000

interface HiddenEntry {
  id: string
  hiddenAt: string
}

function hasSourcePrefix(id: string): boolean {
  return id.includes(":")
}

function isExpired(entry: HiddenEntry, now: number): boolean {
  const hiddenAtMs = new Date(entry.hiddenAt).getTime()
  return Number.isNaN(hiddenAtMs) || now - hiddenAtMs > HIDDEN_TTL_MS
}

// Active = normalized + prefix-valid + within TTL. Used by both reads and mutation
// updaters so any persisted write naturally drops legacy unprefixed entries.
function getActiveHidden(raw: unknown, cutoff: number): HiddenEntry[] {
  return normalizeHidden(raw).filter(
    (entry) => hasSourcePrefix(entry.id) && !isExpired(entry, cutoff),
  )
}

// Converts any stored value (legacy string[] or proper HiddenEntry[]) to HiddenEntry[].
// Legacy strings are stamped with the current time so no hides are lost on upgrade.
// Entries with non-string id/hiddenAt are dropped to prevent runtime errors downstream.
function normalizeHidden(raw: unknown): HiddenEntry[] {
  if (!Array.isArray(raw)) return []
  const now = new Date().toISOString()
  return (raw as unknown[]).flatMap((item) => {
    if (typeof item === "string") return [{ id: item, hiddenAt: now }]
    if (
      item && typeof item === "object" &&
      "id" in item && typeof (item as Record<string, unknown>).id === "string" &&
      "hiddenAt" in item && typeof (item as Record<string, unknown>).hiddenAt === "string"
    ) {
      return [item as HiddenEntry]
    }
    return []
  })
}

interface StoredArticle {
  id: string
  title: string
  description: string
  link: string
  publishedAt: string
  source: string
  language: "de" | "en"
  imageUrl?: string
  category?: string
}

function toStored(article: NormalizedArticle): StoredArticle {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    link: article.link,
    publishedAt: article.publishedAt.toISOString(),
    source: article.source,
    language: article.language,
    imageUrl: article.imageUrl,
    category: article.category,
  }
}

function fromStored(stored: StoredArticle): NormalizedArticle {
  return {
    ...stored,
    publishedAt: new Date(stored.publishedAt),
  }
}

export function useArticleState(): {
  hiddenIds: string[]
  readListIds: string[]
  readListArticles: NormalizedArticle[]
  isHidden: (articleId: string) => boolean
  isInReadList: (articleId: string) => boolean
  hideArticle: (articleId: string) => void
  unhideArticle: (articleId: string) => void
  hideArticles: (ids: string[]) => void
  unhideArticles: (ids: string[]) => void
  addToReadList: (article: NormalizedArticle) => void
  removeFromReadList: (articleId: string) => void
  clearReadList: () => void
  restoreReadList: (articles: NormalizedArticle[]) => void
  removeHiddenBySource: (sourceId: string) => void
  removeReadListBySource: (sourceId: string) => void
} {
  const [rawHiddenEntries, setHiddenEntries] = useSyncedStorage<HiddenEntry[]>(HIDDEN_KEY, [])
  const [storedReadList, setStoredReadList] = useSyncedStorage<StoredArticle[]>(
    READLIST_KEY,
    [],
  )

  // Legacy data (pre-prefix string[] or unprefixed entries) is normalized on read and
  // cleaned up organically the next time a real mutation persists the array. We deliberately
  // do NOT migrate by writing through useSyncedStorage on mount, because that bumps
  // `:updated_at` to "now" and causes this device to win the LWW sync, clobbering hides
  // made on another device.
  //
  // TTL filtering calls Date.now() during render so hiddenIds is always current —
  // entries crossing the 14-day boundary are evicted on the next re-render without a write.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = Date.now()
  const hiddenIds = getActiveHidden(rawHiddenEntries, cutoff).map((entry) => entry.id)

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds])
  const validReadList = useMemo(
    () => storedReadList.filter((a) => hasSourcePrefix(a.id)),
    [storedReadList],
  )
  const readListIdSet = useMemo(
    () => new Set(validReadList.map((a) => a.id)),
    [validReadList],
  )

  const readListIds = useMemo(() => validReadList.map((a) => a.id), [validReadList])
  const readListArticles = useMemo(() => validReadList.map(fromStored), [validReadList])

  const isHidden = useCallback(
    (articleId: string): boolean => hiddenSet.has(articleId),
    [hiddenSet],
  )

  const isInReadList = useCallback(
    (articleId: string): boolean => readListIdSet.has(articleId),
    [readListIdSet],
  )

  const hideArticle = useCallback(
    (articleId: string) => {
      const ts = new Date().toISOString()
      const cutoff = Date.now()
      setHiddenEntries((previous) => {
        const active = getActiveHidden(previous, cutoff)
        if (active.some((entry) => entry.id === articleId)) return active
        return [{ id: articleId, hiddenAt: ts }, ...active]
      })
    },
    [setHiddenEntries],
  )

  const unhideArticle = useCallback(
    (articleId: string) => {
      const cutoff = Date.now()
      setHiddenEntries((previous) =>
        getActiveHidden(previous, cutoff).filter((entry) => entry.id !== articleId),
      )
    },
    [setHiddenEntries],
  )

  const addToReadList = useCallback(
    (article: NormalizedArticle) => {
      let didAdd = false
      let droppedId: string | undefined
      setStoredReadList((previous) => {
        const valid = previous.filter((a) => hasSourcePrefix(a.id))
        if (valid.some((a) => a.id === article.id)) {
          // Preserve reference for true no-ops so memoized derivations stay stable.
          return valid.length === previous.length ? previous : valid
        }
        didAdd = true
        const next = [toStored(article), ...valid]
        if (next.length > MAX_READLIST_ITEMS) {
          droppedId = next.at(-1)?.id
          return next.slice(0, MAX_READLIST_ITEMS)
        }
        return next
      })
      if (didAdd) {
        articleCache.upsertMany([article], { pinned: true }).catch(() => {})
        if (droppedId) {
          articleCache.setPinned(droppedId, false).catch(() => {})
        }
      }
    },
    [setStoredReadList],
  )

  const removeFromReadList = useCallback(
    (articleId: string) => {
      setStoredReadList((previous) =>
        previous.filter((a) => hasSourcePrefix(a.id) && a.id !== articleId),
      )
      articleCache.setPinned(articleId, false).catch(() => {})
    },
    [setStoredReadList],
  )

  const hideArticles = useCallback(
    (ids: string[]) => {
      const ts = new Date().toISOString()
      const cutoff = Date.now()
      setHiddenEntries((previous) => {
        const active = getActiveHidden(previous, cutoff)
        const existing = new Set(active.map((entry) => entry.id))
        const newEntries = ids
          .filter((id) => hasSourcePrefix(id) && !existing.has(id))
          .map((id) => ({ id, hiddenAt: ts }))
        if (newEntries.length === 0) return active
        return [...newEntries, ...active]
      })
    },
    [setHiddenEntries],
  )

  const unhideArticles = useCallback(
    (ids: string[]) => {
      const idsToRemove = new Set(ids)
      const cutoff = Date.now()
      setHiddenEntries((previous) =>
        getActiveHidden(previous, cutoff).filter((entry) => !idsToRemove.has(entry.id)),
      )
    },
    [setHiddenEntries],
  )

  const clearReadList = useCallback(
    () => {
      const ids = storedReadList.filter((a) => hasSourcePrefix(a.id)).map((a) => a.id)
      articleCache.bulkSetPinned(ids, false).catch(() => {})
      setStoredReadList([])
    },
    [storedReadList, setStoredReadList],
  )

  const restoreReadList = useCallback(
    (articles: NormalizedArticle[]) => {
      let articlesToPin: NormalizedArticle[] = []
      let droppedIds: string[] = []
      setStoredReadList((previous) => {
        const validPrevious = previous.filter((a) => hasSourcePrefix(a.id))
        const existingIds = new Set(validPrevious.map((a) => a.id))
        const newEntries = articles.filter(
          (a) => hasSourcePrefix(a.id) && !existingIds.has(a.id),
        )
        const allEntries = [...newEntries.map(toStored), ...validPrevious]
        const capped = allEntries.length > MAX_READLIST_ITEMS
          ? allEntries.slice(0, MAX_READLIST_ITEMS)
          : allEntries
        const cappedIds = new Set(capped.map((a) => a.id))
        articlesToPin = articles.filter((a) => cappedIds.has(a.id))
        droppedIds = validPrevious
          .filter((a) => !cappedIds.has(a.id))
          .map((a) => a.id)
        return capped
      })
      if (articlesToPin.length > 0) {
        articleCache.upsertMany(articlesToPin, { pinned: true }).catch(() => {})
      }
      if (droppedIds.length > 0) {
        articleCache.bulkSetPinned(droppedIds, false).catch(() => {})
      }
    },
    [setStoredReadList],
  )

  const removeHiddenBySource = useCallback(
    (sourceId: string) => {
      const cutoff = Date.now()
      setHiddenEntries((previous) =>
        getActiveHidden(previous, cutoff).filter((entry) => !entry.id.startsWith(`${sourceId}:`)),
      )
    },
    [setHiddenEntries],
  )

  const removeReadListBySource = useCallback(
    (sourceId: string) => {
      let removedIds: string[] = []
      setStoredReadList((previous) => {
        const valid = previous.filter((a) => hasSourcePrefix(a.id))
        removedIds = valid
          .filter((a) => a.source === sourceId)
          .map((a) => a.id)
        return valid.filter((a) => a.source !== sourceId)
      })
      if (removedIds.length > 0) {
        articleCache.bulkSetPinned(removedIds, false).catch(() => {})
      }
    },
    [setStoredReadList],
  )

  return {
    hiddenIds,
    readListIds,
    readListArticles,
    isHidden,
    isInReadList,
    hideArticle,
    unhideArticle,
    hideArticles,
    unhideArticles,
    addToReadList,
    removeFromReadList,
    clearReadList,
    restoreReadList,
    removeHiddenBySource,
    removeReadListBySource,
  }
}
