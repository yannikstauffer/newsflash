import type { NormalizedArticle } from "@/features/connectors/types"

import { feedProxyPath } from "@/config/feeds"
import { fetchFeed } from "@/features/connectors/fetch-feed"
import { connectors } from "@/features/connectors/registry"

export interface FeedPipelineResult {
  readonly articles: NormalizedArticle[]
  readonly errors: string[]
}

export async function fetchAndParseAllFeeds(
  feedIds: string[],
): Promise<FeedPipelineResult> {
  const feedIdSet = new Set(feedIds)
  const errors: string[] = []

  const feedPromises = connectors.flatMap((connector) =>
    connector.feeds
      .filter((feed) => feedIdSet.has(feed.id))
      .map(async (feed): Promise<NormalizedArticle[]> => {
        try {
          const xml = await fetchFeed(feedProxyPath(feed.id))
          return connector.parse(xml).map((article) => ({ ...article, feedId: feed.id }))
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error"
          console.error(
            `[feed-pipeline] Failed to fetch ${connector.name} (${feed.name}): ${message}`,
          )
          errors.push(`${connector.name} (${feed.name}): ${message}`)
          return []
        }
      }),
  )

  const results = await Promise.all(feedPromises)
  return { articles: results.flat(), errors }
}
