import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { readStats } from "./stats-store"
import { useStatsTracker } from "./use-stats-tracker"

import type { Connector, NormalizedArticle } from "@/features/connectors/types"

function makeArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    id: "heise:article-1",
    title: "Test Article",
    description: "Description",
    link: "https://example.com/1",
    publishedAt: new Date("2026-04-14"),
    source: "heise",
    language: "de",
    ...overrides,
  }
}

const heisePlusFilter = {
  id: "heise-plus",
  label: "heise+",
  enabledByDefault: false,
  match: (article: NormalizedArticle) => article.title.startsWith("heise+ |"),
}

const heiseConnector: Connector = {
  id: "heise",
  name: "Heise",
  language: "de",
  feeds: [{ id: "heise", name: "Heise Online" }],
  filters: [heisePlusFilter],
  parse: () => [],
}

describe("useStatsTracker — trackAppeared", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("increments source appeared counter when article appears", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle()

    result.current.trackAppeared([article], [], () => true)

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.sources["heise"]?.appeared).toBe(1)
  })

  it("session-level deduplication: same article does not increment appeared twice", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle()

    result.current.trackAppeared([article], [], () => true)
    result.current.trackAppeared([article], [], () => true)

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.sources["heise"]?.appeared).toBe(1)
  })

  it("new hook mount resets session deduplication", () => {
    const { result: first } = renderHook(() => useStatsTracker())
    const { result: second } = renderHook(() => useStatsTracker())
    const article = makeArticle()

    first.current.trackAppeared([article], [], () => true)
    second.current.trackAppeared([article], [], () => true)

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    // Two independent hook instances each track the article once
    expect(readStats().days[key]?.sources["heise"]?.appeared).toBe(2)
  })

  it("tracks multiple articles independently", () => {
    const { result } = renderHook(() => useStatsTracker())
    const a1 = makeArticle({ id: "heise:1" })
    const a2 = makeArticle({ id: "heise:2" })
    const a3 = makeArticle({ id: "heise:3", source: "srf" })

    result.current.trackAppeared([a1, a2, a3], [], () => true)

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    const day = readStats().days[key]
    expect(day?.sources["heise"]?.appeared).toBe(2)
    expect(day?.sources["srf"]?.appeared).toBe(1)
  })

  it("increments disabled filter appeared for matching article", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle({ title: "heise+ | Premium Article" })

    // heise-plus filter is disabled (isFilterEnabled returns false)
    result.current.trackAppeared([article], [heiseConnector], () => false)

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.filters["heise-plus"]?.appeared).toBe(1)
  })

  it("does not increment filter appeared when filter is enabled", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle({ title: "heise+ | Premium Article" })

    // Filter is enabled (isFilterEnabled returns true) — article wouldn't be shown, but we track it
    result.current.trackAppeared([article], [heiseConnector], () => true)

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.filters["heise-plus"]?.appeared).toBeUndefined()
  })

  it("does not increment filter appeared for non-matching article", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle({ title: "Regular Article" })

    result.current.trackAppeared([article], [heiseConnector], () => false)

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.filters["heise-plus"]?.appeared).toBeUndefined()
  })
})

describe("useStatsTracker — trackHidden", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("increments source hidden counter", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle()

    result.current.trackHidden(article, [])

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.sources["heise"]?.hidden).toBe(1)
  })

  it("increments filter hidden counter for matching disabled filter", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle({ title: "heise+ | Premium Article" })

    result.current.trackHidden(article, [
      { filterId: "heise-plus", match: heisePlusFilter.match },
    ])

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.filters["heise-plus"]?.hidden).toBe(1)
  })

  it("does not increment filter hidden for non-matching article", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle({ title: "Regular Article" })

    result.current.trackHidden(article, [
      { filterId: "heise-plus", match: heisePlusFilter.match },
    ])

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.filters?.["heise-plus"]?.hidden).toBeUndefined()
  })

  it("increments hidden counter without affecting appeared counter", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle()

    result.current.trackHidden(article, [])

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    const source = readStats().days[key]?.sources["heise"]
    expect(source?.hidden).toBe(1)
    expect(source?.appeared).toBe(0)
  })
})

describe("useStatsTracker — trackSaved", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("increments source saved counter", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle({ source: "srf", id: "srf:abc" })

    result.current.trackSaved(article, [])

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.sources["srf"]?.saved).toBe(1)
  })

  it("increments filter saved counter for matching disabled filter", () => {
    const { result } = renderHook(() => useStatsTracker())
    const article = makeArticle({ title: "heise+ | Premium Article" })

    result.current.trackSaved(article, [
      { filterId: "heise-plus", match: heisePlusFilter.match },
    ])

    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    expect(readStats().days[key]?.filters["heise-plus"]?.saved).toBe(1)
  })
})
