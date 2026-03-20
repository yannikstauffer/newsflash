import { useCallback, useMemo } from "react"

import type { NormalizedArticle } from "@/features/connectors/types"

import { useLocalStorage } from "@/hooks/use-local-storage"

const HIDDEN_KEY = "newsflash:hidden"
const READLIST_KEY = "newsflash:readlist"

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
  addToReadList: (article: NormalizedArticle) => void
  removeFromReadList: (articleId: string) => void
  removeHiddenBySource: (sourceId: string) => void
  removeReadListBySource: (sourceId: string) => void
} {
  const [hiddenIds, setHiddenIds] = useLocalStorage<string[]>(HIDDEN_KEY, [])
  const [storedReadList, setStoredReadList] = useLocalStorage<StoredArticle[]>(
    READLIST_KEY,
    [],
  )

  const readListIds = useMemo(() => storedReadList.map((a) => a.id), [storedReadList])
  const readListArticles = useMemo(() => storedReadList.map(fromStored), [storedReadList])

  const isHidden = useCallback(
    (articleId: string): boolean => hiddenIds.includes(articleId),
    [hiddenIds],
  )

  const isInReadList = useCallback(
    (articleId: string): boolean =>
      storedReadList.some((a) => a.id === articleId),
    [storedReadList],
  )

  const hideArticle = useCallback(
    (articleId: string) => {
      setHiddenIds((previous) =>
        previous.includes(articleId) ? previous : [...previous, articleId],
      )
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
      setStoredReadList((previous) =>
        previous.some((a) => a.id === article.id)
          ? previous
          : [toStored(article), ...previous],
      )
    },
    [setStoredReadList],
  )

  const removeFromReadList = useCallback(
    (articleId: string) => {
      setStoredReadList((previous) =>
        previous.filter((a) => a.id !== articleId),
      )
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
    addToReadList,
    removeFromReadList,
    removeHiddenBySource,
    removeReadListBySource,
  }
}
