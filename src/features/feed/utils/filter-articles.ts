import type { NormalizedArticle } from "@/features/connectors/types"

export interface FilterOptions {
  isFeedEnabled: (feedId: string) => boolean
  language: "all" | "de" | "en"
  showHidden: boolean
  hiddenIds: string[]
  searchQuery: string
}

export function filterArticles(
  articles: NormalizedArticle[],
  options: FilterOptions,
): NormalizedArticle[] {
  const { isFeedEnabled, language, showHidden, hiddenIds, searchQuery } =
    options
  const hiddenSet = new Set(hiddenIds)
  const query = searchQuery.toLowerCase().trim()

  return articles.filter((article) => {
    if (!isFeedEnabled(article.source)) {
      return false
    }

    if (language !== "all" && article.language !== language) {
      return false
    }

    if (!showHidden && hiddenSet.has(article.id)) {
      return false
    }

    if (
      query &&
      !article.title.toLowerCase().includes(query) &&
      !article.description.toLowerCase().includes(query)
    ) {
      return false
    }

    return true
  })
}
