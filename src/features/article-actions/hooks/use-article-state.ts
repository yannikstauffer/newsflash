import { useCallback, useMemo, useRef } from "react"

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
// Legacy strings are stamped with `legacyStamp` so the same input produces the same output
// across renders (otherwise legacy entries would never age out via TTL because each render
// would re-stamp them with a fresh "now"). Callers pass the storage key's `:updated_at`
// value as the proxy timestamp, falling back to "now" if unset.
// Entries with non-string id/hiddenAt are dropped to prevent runtime errors downstream.
function normalizeHidden(raw: unknown, legacyStamp: string): HiddenEntry[] {
  if (!Array.isArray(raw)) return []
  return (raw as unknown[]).flatMap((item) => {
    if (typeof item === "string") return [{ id: item, hiddenAt: legacyStamp }]
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

// Active = normalized + prefix-valid + within TTL. Used by both reads and mutation
// updaters so any persisted write naturally drops legacy unprefixed entries.
function getActiveHidden(raw: unknown, cutoff: number, legacyStamp: string): HiddenEntry[] {
  return normalizeHidden(raw, legacyStamp).filter(
    (entry) => hasSourcePrefix(entry.id) && !isExpired(entry, cutoff),
  )
}

// Resolves the timestamp to assign to legacy `string[]` hidden entries.
// Prefers the storage key's `:updated_at` (a stable proxy for when those hides were last
// touched). When absent (very old installs / private-mode storage failures), falls back to
// a value memoized in `fallbackRef` so we don't re-stamp with `now` on every render — that
// would prevent legacy entries from ever aging out via the 14-day TTL.
function resolveLegacyHiddenStamp(fallbackRef: { current: string | null }): string {
  try {
    const stamp = globalThis.localStorage.getItem(`${HIDDEN_KEY}:updated_at`)
    if (stamp) return stamp
  } catch {
    // localStorage blocked / private mode — fall through to memoized fallback
  }
  if (fallbackRef.current === null) {
    fallbackRef.current = new Date().toISOString()
  }
  return fallbackRef.current
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
  // Per-hook-instance fallback for the legacy timestamp when storage has no `:updated_at`.
  // Lazily initialized on first need; preserved across renders so legacy entries can age out.
  const fallbackStampRef = useRef<string | null>(null)

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
  const legacyStamp = resolveLegacyHiddenStamp(fallbackStampRef)
  const hiddenIds = getActiveHidden(rawHiddenEntries, cutoff, legacyStamp).map((entry) => entry.id)

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
      // Reject unprefixed IDs at the entry point so storage stays consistent with the
      // `source:id` format readers expect.
      if (!hasSourcePrefix(articleId)) return
      const ts = new Date().toISOString()
      const cutoff = Date.now()
      const legacyStamp = resolveLegacyHiddenStamp(fallbackStampRef)
      setHiddenEntries((previous) => {
        const active = getActiveHidden(previous, cutoff, legacyStamp)
        if (active.some((entry) => entry.id === articleId)) return active
        return [{ id: articleId, hiddenAt: ts }, ...active]
      })
    },
    [setHiddenEntries],
  )

  const unhideArticle = useCallback(
    (articleId: string) => {
      const cutoff = Date.now()
      const legacyStamp = resolveLegacyHiddenStamp(fallbackStampRef)
      setHiddenEntries((previous) =>
        getActiveHidden(previous, cutoff, legacyStamp).filter((entry) => entry.id !== articleId),
      )
    },
    [setHiddenEntries],
  )

  const addToReadList = useCallback(
    (article: NormalizedArticle) => {
      // Reject unprefixed IDs so we never persist invisible entries (validReadList would
      // filter them out of derived state) or trigger pin calls with invalid IDs.
      if (!hasSourcePrefix(article.id)) return
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
      const legacyStamp = resolveLegacyHiddenStamp(fallbackStampRef)
      setHiddenEntries((previous) => {
        const active = getActiveHidden(previous, cutoff, legacyStamp)
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
      const legacyStamp = resolveLegacyHiddenStamp(fallbackStampRef)
      setHiddenEntries((previous) =>
        getActiveHidden(previous, cutoff, legacyStamp).filter(
          (entry) => !idsToRemove.has(entry.id),
        ),
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
      const legacyStamp = resolveLegacyHiddenStamp(fallbackStampRef)
      setHiddenEntries((previous) =>
        getActiveHidden(previous, cutoff, legacyStamp).filter(
          (entry) => !entry.id.startsWith(`${sourceId}:`),
        ),
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
