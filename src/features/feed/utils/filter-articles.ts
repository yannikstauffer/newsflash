import type { Connector, NormalizedArticle } from "@/features/connectors/types"

export interface FilterOptions {
  isFeedEnabled: (feedId: string) => boolean
  showHidden: boolean
  hiddenIds: string[]
  searchQuery: string
  connectors?: readonly Connector[]
  isFilterEnabled?: (filterId: string, enabledByDefault: boolean) => boolean
}

export function filterArticles(
  articles: NormalizedArticle[],
  options: FilterOptions,
): NormalizedArticle[] {
  const {
    isFeedEnabled, showHidden, hiddenIds, searchQuery,
    connectors: connectorList, isFilterEnabled,
  } = options
  const hiddenSet = new Set(hiddenIds)
  const query = searchQuery.toLowerCase().trim()

  const connectorMap = new Map<string, Connector>()
  if (connectorList) {
    for (const connector of connectorList) {
      connectorMap.set(connector.id, connector)
    }
  }

  return articles.filter((article) => {
    if (!isFeedEnabled(article.source)) {
      return false
    }

    if (!showHidden && hiddenSet.has(article.id)) {
      return false
    }

    if (isFilterEnabled && connectorMap.size > 0) {
      const connector = connectorMap.get(article.source)
      if (connector?.filters) {
        for (const filter of connector.filters) {
          // eslint-disable-next-line unicorn/prefer-regexp-test -- ArticleFilter.match()
          if (!isFilterEnabled(filter.id, filter.enabledByDefault) && filter.match(article)) {
            return false
          }
        }
      }
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
