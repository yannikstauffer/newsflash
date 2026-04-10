import { describe, expect, it } from "vitest"

import { digitecConnector } from "./digitec-connector"
import { engadgetConnector } from "./engadget-connector"
import { galaxusConnector } from "./galaxus-connector"
import { heiseConnector } from "./heise-connector"
import { srfConnector } from "./srf-connector"
import { ubergizmoConnector } from "./ubergizmo-connector"
import { winfutureConnector } from "./winfuture-connector"

const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Article</title>
      <description>A test description</description>
      <link>https://example.com/test</link>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

const ATOM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Atom Test</title>
    <summary>An atom test</summary>
    <link rel="alternate" href="https://example.com/atom-test" />
    <published>2024-01-01T12:00:00Z</published>
  </entry>
</feed>`

const allConnectors = [
  digitecConnector,
  galaxusConnector,
  srfConnector,
  winfutureConnector,
  engadgetConnector,
  heiseConnector,
  ubergizmoConnector,
]

describe("connectors", () => {
  it.each(allConnectors.map((c) => [c.id, c]))(
    "%s has required metadata",
    (_id, connector) => {
      expect(connector.id).toBeTruthy()
      expect(connector.name).toBeTruthy()
      expect(["de", "en"]).toContain(connector.language)
      expect(connector.feeds.length).toBeGreaterThanOrEqual(1)
    },
  )

  it.each(allConnectors.map((c) => [c.id, c]))(
    "%s has unique feed IDs",
    (_id, connector) => {
      const feedIds = connector.feeds.map((f) => f.id)
      expect(new Set(feedIds).size).toBe(feedIds.length)
    },
  )

  it.each(allConnectors.map((c) => [c.id, c]))(
    "%s parses RSS XML into normalized articles",
    (_id, connector) => {
      const xml = connector.id === "heise" ? ATOM_XML : RSS_XML
      const articles = connector.parse(xml)

      expect(articles.length).toBeGreaterThanOrEqual(1)
      expect(articles[0].source).toBe(connector.id)
      expect(articles[0].language).toBe(connector.language)
      expect(articles[0].title).toBeTruthy()
      expect(articles[0].link).toBeTruthy()
      expect(articles[0].id).toBeTruthy()
      expect(articles[0].processed).toBe(true)
    },
  )

  it.each(allConnectors.map((c) => [c.id, c]))(
    "%s returns empty array for malformed XML",
    (_id, connector) => {
      expect(connector.parse("garbage")).toEqual([])
    },
  )
})

describe("digitecConnector", () => {
  it("has correct metadata", () => {
    expect(digitecConnector.id).toBe("digitec")
    expect(digitecConnector.language).toBe("de")
    expect(digitecConnector.feeds).toHaveLength(1)
  })
})

describe("galaxusConnector", () => {
  it("has correct metadata", () => {
    expect(galaxusConnector.id).toBe("galaxus")
    expect(galaxusConnector.language).toBe("de")
    expect(galaxusConnector.feeds).toHaveLength(1)
  })
})

describe("srfConnector", () => {
  it("exposes 26 topic-level feeds", () => {
    expect(srfConnector.feeds).toHaveLength(26)
  })

  it("includes expected topic feeds", () => {
    const feedNames = srfConnector.feeds.map((f) => f.name)
    expect(feedNames).toContain("Das Neueste")
    expect(feedNames).toContain("Schweiz")
    expect(feedNames).toContain("International")
    expect(feedNames).toContain("Fussball")
    expect(feedNames).toContain("Technik")
    expect(feedNames).toContain("Eishockey")
    expect(feedNames).toContain("Film & Serien")
    expect(feedNames).toContain("Gesundheit")
  })

  it("has unique sub-feed IDs", () => {
    const ids = srfConnector.feeds.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("assigns all feeds to one of the 4 groups", () => {
    const validGroups = ["News", "Sport", "Kultur", "Wissen"]
    for (const feed of srfConnector.feeds) {
      expect(validGroups).toContain(feed.group)
    }
  })

  it("has correct feed counts per group", () => {
    const groupCounts = new Map<string, number>()
    for (const feed of srfConnector.feeds) {
      const group = feed.group ?? "ungrouped"
      groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1)
    }
    expect(groupCounts.get("News")).toBe(5)
    expect(groupCounts.get("Sport")).toBe(8)
    expect(groupCounts.get("Kultur")).toBe(7)
    expect(groupCounts.get("Wissen")).toBe(6)
  })
})

describe("winfutureConnector", () => {
  it("has correct metadata", () => {
    expect(winfutureConnector.id).toBe("winfuture")
    expect(winfutureConnector.language).toBe("de")
  })
})

describe("engadgetConnector", () => {
  it("has correct metadata", () => {
    expect(engadgetConnector.id).toBe("engadget")
    expect(engadgetConnector.language).toBe("en")
  })
})

describe("heiseConnector", () => {
  it("has correct metadata", () => {
    expect(heiseConnector.id).toBe("heise")
    expect(heiseConnector.language).toBe("de")
  })

  it("parses Atom format", () => {
    const articles = heiseConnector.parse(ATOM_XML)
    expect(articles).toHaveLength(1)
    expect(articles[0].title).toBe("Atom Test")
  })
})

describe("ubergizmoConnector", () => {
  it("has correct metadata", () => {
    expect(ubergizmoConnector.id).toBe("ubergizmo")
    expect(ubergizmoConnector.language).toBe("en")
  })
})
