import { describe, expect, it } from "vitest"

import { digitecConnector } from "./digitec-connector"
import { engadgetConnector } from "./engadget-connector"
import { galaxusConnector } from "./galaxus-connector"
import { heiseConnector } from "./heise-connector"
import { srfConnector } from "./srf-connector"
import { ubergizmoConnector } from "./ubergizmo-connector"
import { winfutureConnector } from "./winfuture-connector"

import type { NormalizedArticle } from "../types"

function makeArticle(overrides: Partial<NormalizedArticle> = {}): NormalizedArticle {
  return {
    id: "test:abc123",
    title: "Test Article",
    description: "A description",
    link: "https://example.com/test",
    publishedAt: new Date("2024-01-01"),
    source: "test",
    language: "de",
    ...overrides,
  }
}

describe("heise filters", () => {
  const filters = heiseConnector.filters!

  it("defines exactly 2 filters", () => {
    expect(filters).toHaveLength(2)
  })

  describe("heise-plus", () => {
    const filter = filters.find((f) => f.id === "heise-plus")!

    it("is disabled by default", () => {
      expect(filter.enabledByDefault).toBe(false)
    })

    it("matches articles with heise+ title prefix", () => {
      const article = makeArticle({ title: "heise+ | Some paid article title" })
      expect(filter.match(article)).toBe(true)
    })

    it("does not match regular articles", () => {
      const article = makeArticle({ title: "Windows: Update außer der Reihe" })
      expect(filter.match(article)).toBe(false)
    })
  })

  describe("heise-angebot", () => {
    const filter = filters.find((f) => f.id === "heise-angebot")!

    it("is enabled by default", () => {
      expect(filter.enabledByDefault).toBe(true)
    })

    it("matches articles with heise-Angebot title prefix", () => {
      const article = makeArticle({ title: "heise-Angebot: Workshop XYZ" })
      expect(filter.match(article)).toBe(true)
    })

    it("does not match regular articles", () => {
      const article = makeArticle({ title: "Windows: Update außer der Reihe" })
      expect(filter.match(article)).toBe(false)
    })
  })
})

describe("digitec filters", () => {
  const filters = digitecConnector.filters!

  it("defines exactly 7 category filters", () => {
    expect(filters).toHaveLength(7)
  })

  it("all have digitec- prefixed IDs", () => {
    for (const filter of filters) {
      expect(filter.id).toMatch(/^digitec-/)
    }
  })

  it("all are enabled by default", () => {
    for (const filter of filters) {
      expect(filter.enabledByDefault).toBe(true)
    }
  })

  it.each([
    ["Produkttest", "digitec-produkttest"],
    ["Hintergrund", "digitec-hintergrund"],
    ["Kritik", "digitec-kritik"],
    ["Meinung", "digitec-meinung"],
    ["Neu im Sortiment", "digitec-neu-im-sortiment"],
    ["Ratgeber", "digitec-ratgeber"],
    ["Hinter den Kulissen", "digitec-hinter-den-kulissen"],
  ])("matches articles with category %s (filter %s)", (category, filterId) => {
    const filter = filters.find((f) => f.id === filterId)!
    const matching = makeArticle({ category })
    const nonMatching = makeArticle({ category: "Other" })

    expect(filter.match(matching)).toBe(true)
    expect(filter.match(nonMatching)).toBe(false)
  })
})

describe("galaxus filters", () => {
  const filters = galaxusConnector.filters!

  it("defines exactly 7 category filters", () => {
    expect(filters).toHaveLength(7)
  })

  it("all have galaxus- prefixed IDs", () => {
    for (const filter of filters) {
      expect(filter.id).toMatch(/^galaxus-/)
    }
  })

  it("all are enabled by default", () => {
    for (const filter of filters) {
      expect(filter.enabledByDefault).toBe(true)
    }
  })

  it("mirrors digitec categories", () => {
    const digitecLabels = digitecConnector.filters!.map((f) => f.label)
    const galaxusLabels = filters.map((f) => f.label)
    expect(galaxusLabels).toEqual(digitecLabels)
  })
})

describe("winfuture filters", () => {
  const filters = winfutureConnector.filters!

  it("defines exactly 1 filter", () => {
    expect(filters).toHaveLength(1)
  })

  describe("winfuture-downloads", () => {
    const filter = filters.find((f) => f.id === "winfuture-downloads")!

    it("is enabled by default", () => {
      expect(filter.enabledByDefault).toBe(true)
    })

    it("matches downloadvorschalt URLs", () => {
      const article = makeArticle({
        link: "https://winfuture.de/downloadvorschalt,4010.html",
      })
      expect(filter.match(article)).toBe(true)
    })

    it("matches /download/ URLs", () => {
      const article = makeArticle({
        link: "https://winfuture.de/download/product/4200/",
      })
      expect(filter.match(article)).toBe(true)
    })

    it("does not match regular news URLs", () => {
      const article = makeArticle({
        link: "https://winfuture.de/news,12345.html",
      })
      expect(filter.match(article)).toBe(false)
    })
  })
})

describe("srf filters", () => {
  const filters = srfConnector.filters!

  it("defines exactly 3 category filters", () => {
    expect(filters).toHaveLength(3)
  })

  it("all have srf-filter- prefixed IDs", () => {
    for (const filter of filters) {
      expect(filter.id).toMatch(/^srf-filter-/)
    }
  })

  it("all are enabled by default", () => {
    for (const filter of filters) {
      expect(filter.enabledByDefault).toBe(true)
    }
  })

  describe("srf-filter-sport", () => {
    const filter = filters.find((f) => f.id === "srf-filter-sport")!

    it("matches sport article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/sport/eishockey/swiss-league/final",
      })
      expect(filter.match(article)).toBe(true)
    })

    it("does not match news article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/news/schweiz/some-article",
      })
      expect(filter.match(article)).toBe(false)
    })

    it("does not match kultur article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/kultur/musik/some-article",
      })
      expect(filter.match(article)).toBe(false)
    })
  })

  describe("srf-filter-kultur", () => {
    const filter = filters.find((f) => f.id === "srf-filter-kultur")!

    it("matches kultur article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/kultur/musik/jesus-christ-superstar",
      })
      expect(filter.match(article)).toBe(true)
    })

    it("does not match news article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/news/schweiz/some-article",
      })
      expect(filter.match(article)).toBe(false)
    })

    it("does not match sport article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/sport/fussball/some-article",
      })
      expect(filter.match(article)).toBe(false)
    })
  })

  describe("srf-filter-wissen", () => {
    const filter = filters.find((f) => f.id === "srf-filter-wissen")!

    it("matches wissen article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/wissen/klimawandel/some-article",
      })
      expect(filter.match(article)).toBe(true)
    })

    it("matches wissen sub-categories like gesundheit and natur-tiere", () => {
      const gesundheit = makeArticle({
        link: "https://www.srf.ch/wissen/gesundheit/some-article",
      })
      const natur = makeArticle({
        link: "https://www.srf.ch/wissen/natur-tiere/some-article",
      })
      expect(filter.match(gesundheit)).toBe(true)
      expect(filter.match(natur)).toBe(true)
    })

    it("does not match news article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/news/schweiz/some-article",
      })
      expect(filter.match(article)).toBe(false)
    })

    it("does not match sport article URLs", () => {
      const article = makeArticle({
        link: "https://www.srf.ch/sport/fussball/some-article",
      })
      expect(filter.match(article)).toBe(false)
    })
  })
})

describe("connectors without filters", () => {
  it.each([
    ["engadget", engadgetConnector],
    ["ubergizmo", ubergizmoConnector],
  ])("%s has no filters", (_id, connector) => {
    expect(connector.filters).toBeUndefined()
  })
})
