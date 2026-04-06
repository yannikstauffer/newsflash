import { useCallback, useEffect, useMemo, useRef } from "react"

import type { NormalizedArticle } from "@/features/connectors/types"

import { useSyncedStorage } from "@/hooks/use-synced-storage"
import * as articleCache from "@/lib/article-cache"

export const MAX_HIDDEN_IDS = 500
export const MAX_READLIST_ITEMS = 200

const HIDDEN_KEY = "newsflash:hidden"
const READLIST_KEY = "newsflash:readlist"

function hasSourcePrefix(id: string): boolean {
  return id.includes(":")
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
  const [hiddenIds, setHiddenIds] = useSyncedStorage<string[]>(HIDDEN_KEY, [])
  const [storedReadList, setStoredReadList] = useSyncedStorage<StoredArticle[]>(
    READLIST_KEY,
    [],
  )

  const hiddenMigrated = useRef(false)
  const readListMigrated = useRef(false)

  useEffect(() => {
    if (!hiddenMigrated.current && hiddenIds.some((id) => !hasSourcePrefix(id))) {
      hiddenMigrated.current = true
      setHiddenIds((previous) => previous.filter(hasSourcePrefix))
    }
  }, [hiddenIds, setHiddenIds])

  useEffect(() => {
    if (!readListMigrated.current && storedReadList.some((a) => !hasSourcePrefix(a.id))) {
      readListMigrated.current = true
      setStoredReadList((previous) => previous.filter((a) => hasSourcePrefix(a.id)))
    }
  }, [storedReadList, setStoredReadList])

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
      setHiddenIds((previous) => {
        if (previous.includes(articleId)) return previous
        const next = [articleId, ...previous]
        return next.length > MAX_HIDDEN_IDS ? next.slice(0, MAX_HIDDEN_IDS) : next
      })
    },
    [setHiddenIds],
  )

  const unhideArticle = useCallback(
    (articleId: string) => {
      setHiddenIds((previous) => previous.filter((id) => id !== articleId))
    },
    [setHiddenIds],
  )

  const addToReadList = useCallback(
    (article: NormalizedArticle) => {
      setStoredReadList((previous) => {
        if (previous.some((a) => a.id === article.id)) return previous
        const next = [toStored(article), ...previous]
        return next.length > MAX_READLIST_ITEMS
          ? next.slice(0, MAX_READLIST_ITEMS)
          : next
      })
      articleCache.setPinned(article.id, true).catch(() => {})
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
      setHiddenIds((previous) => {
        const existing = new Set(previous)
        const newIds = ids.filter((id) => !existing.has(id))
        if (newIds.length === 0) return previous
        const next = [...newIds, ...previous]
        return next.length > MAX_HIDDEN_IDS ? next.slice(0, MAX_HIDDEN_IDS) : next
      })
    },
    [setHiddenIds],
  )

  const unhideArticles = useCallback(
    (ids: string[]) => {
      const idsToRemove = new Set(ids)
      setHiddenIds((previous) => previous.filter((id) => !idsToRemove.has(id)))
    },
    [setHiddenIds],
  )

  const clearReadList = useCallback(
    () => {
      for (const article of storedReadList) {
        articleCache.setPinned(article.id, false).catch(() => {})
      }
      setStoredReadList([])
    },
    [storedReadList, setStoredReadList],
  )

  const restoreReadList = useCallback(
    (articles: NormalizedArticle[]) => {
      setStoredReadList((previous) => {
        const existingIds = new Set(previous.map((a) => a.id))
        const newEntries = articles
          .filter((a) => !existingIds.has(a.id))
          .map(toStored)
        const next = [...newEntries, ...previous]
        return next.length > MAX_READLIST_ITEMS ? next.slice(0, MAX_READLIST_ITEMS) : next
      })
      for (const article of articles) {
        articleCache.setPinned(article.id, true).catch(() => {})
      }
    },
    [setStoredReadList],
  )

  const removeHiddenBySource = useCallback(
    (sourceId: string) => {
      setHiddenIds((previous) =>
        previous.filter((id) => !id.startsWith(`${sourceId}:`)),
      )
    },
    [setHiddenIds],
  )

  const removeReadListBySource = useCallback(
    (sourceId: string) => {
      setStoredReadList((previous) =>
        previous.filter((a) => a.source !== sourceId),
      )
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
