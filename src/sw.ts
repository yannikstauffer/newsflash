/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope

import { CacheableResponsePlugin } from "workbox-cacheable-response"
import { clientsClaim } from "workbox-core"
import { ExpirationPlugin } from "workbox-expiration"
import { createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching"
import { NavigationRoute, registerRoute } from "workbox-routing"
import { CacheFirst, NetworkFirst } from "workbox-strategies"

import { feedUrls } from "@/config/feeds"
import * as articleCache from "@/lib/article-cache"
import { fetchAndParseAllFeeds } from "@/lib/feed-pipeline"
import { getFeedPreferences, setLastSyncedAt } from "@/lib/sync-metadata"

// Auto-update: take control immediately
self.skipWaiting()
clientsClaim()

// Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)

// SPA navigation fallback: serve precached index.html for all navigation requests
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")))

// Runtime caching: feed API requests (NetworkFirst with 5s timeout)
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/rss/"),
  new NetworkFirst({
    cacheName: "feed-api-cache",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 3 * 24 * 60 * 60,
      }),
    ],
  }),
)

// Runtime caching: article images (CacheFirst)
registerRoute(
  ({ url }) =>
    url.origin !== self.location.origin &&
    /\.(jpg|jpeg|png|webp|gif|avif)(\?|#|$)/i.test(url.pathname),
  new CacheFirst({
    cacheName: "article-images-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  }),
)

// Periodic Background Sync: pre-warm article cache
async function getEnabledFeedIds(): Promise<string[]> {
  const allFeedIds = Object.keys(feedUrls)
  const preferences = await getFeedPreferences().catch(() => null)
  if (!preferences) return allFeedIds
  return allFeedIds.filter((id) =>
    // eslint-disable-next-line security/detect-object-injection -- id is from our feedUrls config
    preferences[id] !== false,
  )
}

async function syncFeeds(): Promise<void> {
  try {
    const feedIds = await getEnabledFeedIds()
    const result = await fetchAndParseAllFeeds(feedIds)
    if (result.articles.length > 0) {
      await articleCache.upsertMany(result.articles)
      await setLastSyncedAt(new Date())
    }
  } catch (error) {
    console.error("[sw] periodic sync failed:", error)
  }
}

self.addEventListener("periodicsync", ((event: Event) => {
  const syncEvent = event as ExtendableEvent & { readonly tag: string }
  if (syncEvent.tag !== "feed-refresh") return
  syncEvent.waitUntil(syncFeeds())
}) as EventListener)
