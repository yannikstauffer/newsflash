import { useCallback, useEffect, useMemo, useRef } from "react"

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

  const readListMigrated = useRef(false)

  // Migrate legacy string[] or entries without colon prefix to timestamped HiddenEntry[].
  // Re-runs whenever rawHiddenEntries changes so sync-pushed legacy data is also normalized.
  // normalizeHidden handles non-array values safely (returns []), removing the need to guard
  // against null/object storage corruption before calling .some().
  useEffect(() => {
    const normalized = normalizeHidden(rawHiddenEntries)
    const hasLegacyStrings = Array.isArray(rawHiddenEntries) &&
      (rawHiddenEntries as unknown[]).some((item) => typeof item === "string")
    const hasUnprefixedIds = normalized.some((entry) => !hasSourcePrefix(entry.id))

    if (hasLegacyStrings || hasUnprefixedIds) {
      setHiddenEntries(normalized.filter((entry) => hasSourcePrefix(entry.id)))
    }
  }, [rawHiddenEntries, setHiddenEntries])

  useEffect(() => {
    if (!readListMigrated.current && storedReadList.some((a) => !hasSourcePrefix(a.id))) {
      readListMigrated.current = true
      setStoredReadList((previous) => previous.filter((a) => hasSourcePrefix(a.id)))
    }
  }, [storedReadList, setStoredReadList])

  // TTL filtering intentionally calls Date.now() during render so hiddenIds is always up-to-date —
  // entries that cross the 14-day boundary are evicted on the next re-render without requiring a write.
  // The react-hooks/purity rule flags Date.now() as impure, but this is a deliberate trade-off:
  // the component IS deterministic given the same inputs at the same instant in time; the impurity
  // is bounded and acceptable here.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = Date.now()
  const hiddenIds = normalizeHidden(rawHiddenEntries)
    .filter((entry) => !isExpired(entry, cutoff))
    .map((entry) => entry.id)

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds])
  const readListIdSet = useMemo(
    () => new Set(storedReadList.map((a) => a.id)),
    [storedReadList],
  )

  const readListIds = useMemo(() => storedReadList.map((a) => a.id), [storedReadList])
  const readListArticles = useMemo(() => storedReadList.map(fromStored), [storedReadList])

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
        const active = normalizeHidden(previous).filter((entry) => !isExpired(entry, cutoff))
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
        normalizeHidden(previous)
          .filter((entry) => !isExpired(entry, cutoff) && entry.id !== articleId),
      )
    },
    [setHiddenEntries],
  )

  const addToReadList = useCallback(
    (article: NormalizedArticle) => {
      let didAdd = false
      let droppedId: string | undefined
      setStoredReadList((previous) => {
        if (previous.some((a) => a.id === article.id)) return previous
        didAdd = true
        const next = [toStored(article), ...previous]
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
        previous.filter((a) => a.id !== articleId),
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
        const active = normalizeHidden(previous).filter((entry) => !isExpired(entry, cutoff))
        const existing = new Set(active.map((entry) => entry.id))
        const newEntries = ids
          .filter((id) => !existing.has(id))
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
        normalizeHidden(previous)
          .filter((entry) => !isExpired(entry, cutoff) && !idsToRemove.has(entry.id)),
      )
    },
    [setHiddenEntries],
  )

  const clearReadList = useCallback(
    () => {
      const ids = storedReadList.map((a) => a.id)
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
        const existingIds = new Set(previous.map((a) => a.id))
        const newEntries = articles.filter((a) => !existingIds.has(a.id))
        const allEntries = [...newEntries.map(toStored), ...previous]
        const capped = allEntries.length > MAX_READLIST_ITEMS
          ? allEntries.slice(0, MAX_READLIST_ITEMS)
          : allEntries
        const cappedIds = new Set(capped.map((a) => a.id))
        articlesToPin = articles.filter((a) => cappedIds.has(a.id))
        droppedIds = previous
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
        normalizeHidden(previous)
          .filter((entry) => !isExpired(entry, cutoff) && !entry.id.startsWith(`${sourceId}:`)),
      )
    },
    [setHiddenEntries],
  )

  const removeReadListBySource = useCallback(
    (sourceId: string) => {
      let removedIds: string[] = []
      setStoredReadList((previous) => {
        removedIds = previous
          .filter((a) => a.source === sourceId)
          .map((a) => a.id)
        return previous.filter((a) => a.source !== sourceId)
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
