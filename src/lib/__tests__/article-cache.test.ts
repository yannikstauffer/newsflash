import "fake-indexeddb/auto"

import { beforeEach, describe, expect, it } from "vitest"

import {
  _resetForTesting,
  bulkSetPinned,
  evict,
  getAll,
  getByDateRange,
  setPinned,
  upsertMany,
} from "../article-cache"

import type { NormalizedArticle } from "@/features/connectors/types"

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function makeArticle(
  overrides: Partial<NormalizedArticle> = {},
): NormalizedArticle {
  return {
    id: "art-1",
    title: "Test Article",
    description: "A test description",
    link: "https://example.com/article",
    publishedAt: daysAgo(1), // yesterday — always within 14-day retention window
    source: "test-source",
    language: "en",
    ...overrides,
  }
}

beforeEach(async () => {
  await _resetForTesting()
  const deleteRequest = indexedDB.deleteDatabase("newsflash-articles")
  await new Promise<void>((resolve, reject) => {
    deleteRequest.onsuccess = () => resolve()
    deleteRequest.addEventListener("error", () =>
      reject(deleteRequest.error),
    )
    deleteRequest.addEventListener("blocked", () =>
      reject(
        new Error(
          "Failed to delete IndexedDB database: deletion was blocked by an open connection.",
        ),
      ),
    )
  })
})

describe("article-cache", () => {
  describe("database initialization", () => {
    it("should create database and store on first access", async () => {
      await upsertMany([makeArticle()])
      const articles = await getAll()
      expect(articles).toHaveLength(1)
    })

    it("should reuse existing database on subsequent access", async () => {
      await upsertMany([makeArticle()])
      const first = await getAll()
      const second = await getAll()
      expect(first).toEqual(second)
    })

    it("should return empty results when IndexedDB is unavailable", async () => {
      const original = globalThis.indexedDB
      try {
        // @ts-expect-error — simulate IDB unavailable
        globalThis.indexedDB = undefined
        await _resetForTesting()

        const articles = await getAll()
        expect(articles).toEqual([])

        await expect(upsertMany([makeArticle()])).resolves.toBeUndefined()
      } finally {
        globalThis.indexedDB = original
        await _resetForTesting()
      }
    })
  })

  describe("upsertMany", () => {
    it("should insert new articles with pinned=false and cachedAt set", async () => {
      await upsertMany([makeArticle()])
      const articles = await getAll()

      expect(articles).toHaveLength(1)
      expect(articles[0].id).toBe("art-1")
      expect(articles[0]).not.toHaveProperty("pinned")
      expect(articles[0]).not.toHaveProperty("pinnedKey")
      expect(articles[0]).not.toHaveProperty("cachedAt")
    })

    it("should update existing article but preserve pinned and cachedAt", async () => {
      await upsertMany([makeArticle()])
      await setPinned("art-1", true)

      await upsertMany([makeArticle({ title: "Updated Title" })])
      const articles = await getAll()

      expect(articles).toHaveLength(1)
      expect(articles[0].title).toBe("Updated Title")

      // Verify pinned was preserved by checking it survives eviction
      await evict(0)
      const afterEvict = await getAll()
      expect(afterEvict).toHaveLength(1)
    })

    it("should handle mixed insert and update", async () => {
      await upsertMany([makeArticle({ id: "art-1" })])

      await upsertMany([
        makeArticle({ id: "art-1", title: "Updated" }),
        makeArticle({ id: "art-2", title: "New Article" }),
      ])

      const articles = await getAll()
      expect(articles).toHaveLength(2)
      expect(articles.find((a) => a.id === "art-1")?.title).toBe("Updated")
      expect(articles.find((a) => a.id === "art-2")?.title).toBe("New Article")
    })

    it("should insert articles as pinned when pinned option is true", async () => {
      const oldDate = new Date("2020-01-01T00:00:00Z")
      await upsertMany([makeArticle({ id: "art-1", publishedAt: oldDate })], {
        pinned: true,
      })

      // Pinned articles survive eviction (which runs automatically after upsert)
      const articles = await getAll()
      expect(articles).toHaveLength(1)
      expect(articles[0].id).toBe("art-1")
    })

    it("should not override existing pinned state when pinned option is omitted", async () => {
      await upsertMany([makeArticle({ id: "art-1" })])
      await setPinned("art-1", true)

      // Re-upsert without pinned option — should preserve pin
      await upsertMany([makeArticle({ id: "art-1", title: "Updated" })])

      await evict(0)
      const articles = await getAll()
      expect(articles).toHaveLength(1)
      expect(articles[0].title).toBe("Updated")
    })

    it("should trigger eviction after upsert", async () => {
      const oldDate = new Date("2020-01-01T00:00:00Z")
      await upsertMany([makeArticle({ id: "old", publishedAt: oldDate })])

      // upsertMany triggers evict, so old unpinned article should be gone
      const articles = await getAll()
      expect(articles).toHaveLength(0)
    })
  })

  describe("getAll", () => {
    it("should return all cached articles as NormalizedArticle", async () => {
      await upsertMany([
        makeArticle({ id: "art-1" }),
        makeArticle({ id: "art-2", title: "Second" }),
      ])

      const articles = await getAll()
      expect(articles).toHaveLength(2)

      for (const article of articles) {
        expect(article).not.toHaveProperty("pinned")
        expect(article).not.toHaveProperty("pinnedKey")
        expect(article).not.toHaveProperty("cachedAt")
      }
    })

    it("should return empty array when cache is empty", async () => {
      const articles = await getAll()
      expect(articles).toEqual([])
    })
  })

  describe("getByDateRange", () => {
    it("should return articles within the date range", async () => {
      // Use relative dates to avoid eviction as real time passes
      await upsertMany([
        makeArticle({ id: "art-1", publishedAt: daysAgo(5) }),
        makeArticle({ id: "art-2", publishedAt: daysAgo(3) }),
        makeArticle({ id: "art-3", publishedAt: daysAgo(1) }),
      ])

      const results = await getByDateRange(daysAgo(4), daysAgo(2))

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe("art-2")
    })

    it("should return empty array when no articles in range", async () => {
      await upsertMany([
        makeArticle({ id: "art-1", publishedAt: daysAgo(1) }),
      ])

      // Query a range far in the future — should return nothing
      const futureStart = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const futureEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

      const results = await getByDateRange(futureStart, futureEnd)

      expect(results).toEqual([])
    })

    it("should include boundary values", async () => {
      // Use a date 2 days ago — safely within the 14-day retention window.
      // Use UTC throughout to avoid local-time/toISOString() off-by-one near midnight.
      const twoDaysAgo = new Date()
      twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2)
      const start = new Date(Date.UTC(
        twoDaysAgo.getUTCFullYear(),
        twoDaysAgo.getUTCMonth(),
        twoDaysAgo.getUTCDate(),
        0, 0, 0, 0,
      ))
      const end = new Date(Date.UTC(
        twoDaysAgo.getUTCFullYear(),
        twoDaysAgo.getUTCMonth(),
        twoDaysAgo.getUTCDate(),
        23, 59, 59, 999,
      ))

      await upsertMany([
        makeArticle({ id: "art-1", publishedAt: start }),
        makeArticle({ id: "art-2", publishedAt: end }),
      ])

      const results = await getByDateRange(start, end)
      expect(results).toHaveLength(2)
    })
  })

  describe("setPinned", () => {
    it("should pin an article", async () => {
      await upsertMany([makeArticle({ id: "art-1" })])
      await setPinned("art-1", true)

      // Pinned articles survive aggressive eviction
      await evict(0)
      const articles = await getAll()
      expect(articles).toHaveLength(1)
    })

    it("should unpin an article", async () => {
      await upsertMany([makeArticle({ id: "art-1" })])
      await setPinned("art-1", true)
      await setPinned("art-1", false)

      // Unpinned articles with old dates get evicted
      await evict(0)
      const articles = await getAll()
      expect(articles).toHaveLength(0)
    })

    it("should be a no-op for non-existent article", async () => {
      await expect(
        setPinned("non-existent", true),
      ).resolves.toBeUndefined()
    })
  })

  describe("bulkSetPinned", () => {
    it("should pin multiple articles in a single transaction", async () => {
      await upsertMany([
        makeArticle({ id: "art-1" }),
        makeArticle({ id: "art-2" }),
        makeArticle({ id: "art-3" }),
      ])

      await bulkSetPinned(["art-1", "art-3"], true)

      // Pinned articles survive aggressive eviction, unpinned don't
      await evict(0)
      const articles = await getAll()
      expect(articles).toHaveLength(2)
      expect(articles.map((a) => a.id).sort()).toEqual(["art-1", "art-3"])
    })

    it("should unpin multiple articles in a single transaction", async () => {
      await upsertMany([
        makeArticle({ id: "art-1" }),
        makeArticle({ id: "art-2" }),
      ])
      await bulkSetPinned(["art-1", "art-2"], true)
      await bulkSetPinned(["art-1", "art-2"], false)

      await evict(0)
      const articles = await getAll()
      expect(articles).toHaveLength(0)
    })

    it("should skip non-existent ids without error", async () => {
      await upsertMany([makeArticle({ id: "art-1" })])

      await expect(
        bulkSetPinned(["art-1", "non-existent", "also-missing"], true),
      ).resolves.toBeUndefined()

      await evict(0)
      const articles = await getAll()
      expect(articles).toHaveLength(1)
      expect(articles[0].id).toBe("art-1")
    })

    it("should be a no-op for empty ids array", async () => {
      await expect(bulkSetPinned([], true)).resolves.toBeUndefined()
    })
  })

  describe("evict", () => {
    it("should delete old unpinned articles", async () => {
      const oldDate = new Date("2020-01-01T00:00:00Z")
      const recentDate = new Date()

      await upsertMany([
        makeArticle({ id: "old", publishedAt: oldDate }),
        makeArticle({ id: "recent", publishedAt: recentDate }),
      ])

      // Old article was already evicted by auto-evict in upsertMany
      const articles = await getAll()
      expect(articles).toHaveLength(1)
      expect(articles[0].id).toBe("recent")
    })

    it("should preserve pinned articles regardless of age", async () => {
      // Insert with a recent date so auto-eviction in upsertMany keeps it
      await upsertMany([makeArticle({ id: "old-pinned" })])

      // Pin it, then evict with maxAgeDays=0 (evicts everything unpinned)
      await setPinned("old-pinned", true)
      await evict(0)

      const articles = await getAll()
      expect(articles).toHaveLength(1)
      expect(articles[0].id).toBe("old-pinned")
    })

    it("should not delete anything when all articles are within retention", async () => {
      const recentDate = new Date()

      await upsertMany([
        makeArticle({ id: "art-1", publishedAt: recentDate }),
        makeArticle({ id: "art-2", publishedAt: recentDate }),
      ])

      await evict()
      const articles = await getAll()
      expect(articles).toHaveLength(2)
    })
  })
})
