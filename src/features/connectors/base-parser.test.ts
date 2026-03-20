import { describe, expect, it } from "vitest"

import { hashString53, parseRss } from "./base-parser"

const RSS_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article One</title>
      <description>First article description</description>
      <link>https://example.com/article-1</link>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
      <category>Tech</category>
    </item>
    <item>
      <title>Article Two</title>
      <description>Second article description</description>
      <link>https://example.com/article-2</link>
      <pubDate>Tue, 02 Jan 2024 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

const ATOM_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Atom Feed</title>
  <entry>
    <title>Atom Article</title>
    <summary>Atom article summary</summary>
    <link rel="alternate" href="https://example.com/atom-1" />
    <published>2024-01-03T12:00:00Z</published>
    <category term="Science" />
  </entry>
</feed>`

const RSS_WITH_MEDIA = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <item>
      <title>With Image</title>
      <description>Has thumbnail</description>
      <link>https://example.com/with-image</link>
      <pubDate>Wed, 03 Jan 2024 12:00:00 GMT</pubDate>
      <media:thumbnail url="https://example.com/thumb.jpg" />
    </item>
  </channel>
</rss>`

describe("parseRss", () => {
  describe("RSS 2.0", () => {
    it("parses standard RSS 2.0 items", () => {
      const articles = parseRss(RSS_FEED, "test", "en")

      expect(articles).toHaveLength(2)
      expect(articles[0]).toMatchObject({
        title: "Article One",
        description: "First article description",
        link: "https://example.com/article-1",
        source: "test",
        language: "en",
        category: "Tech",
      })
      expect(articles[0].publishedAt).toEqual(new Date("2024-01-01T12:00:00Z"))
      expect(articles[0].id).toMatch(/^test:/)
    })

    it("generates deterministic IDs from link", () => {
      const articles = parseRss(RSS_FEED, "test", "en")
      const articles2 = parseRss(RSS_FEED, "test", "en")

      expect(articles[0].id).toBe(articles2[0].id)
    })

    it("generates IDs with source prefix", () => {
      const articles = parseRss(RSS_FEED, "heise", "en")

      expect(articles[0].id).toMatch(/^heise:/)
      expect(articles[1].id).toMatch(/^heise:/)
    })

    it("sets undefined for missing optional fields", () => {
      const articles = parseRss(RSS_FEED, "test", "en")

      expect(articles[1].imageUrl).toBeUndefined()
      expect(articles[1].category).toBeUndefined()
    })

    it("extracts media:thumbnail URL", () => {
      const articles = parseRss(RSS_WITH_MEDIA, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/thumb.jpg")
    })
  })

  describe("Atom", () => {
    it("parses Atom entries", () => {
      const articles = parseRss(ATOM_FEED, "test", "en")

      expect(articles).toHaveLength(1)
      expect(articles[0]).toMatchObject({
        title: "Atom Article",
        description: "Atom article summary",
        link: "https://example.com/atom-1",
        source: "test",
        language: "en",
      })
      expect(articles[0].publishedAt).toEqual(new Date("2024-01-03T12:00:00Z"))
    })
  })

  describe("error handling", () => {
    it("returns empty array for malformed XML", () => {
      const articles = parseRss("not xml at all {{{", "test", "en")

      expect(articles).toEqual([])
    })

    it("returns empty array for empty string", () => {
      const articles = parseRss("", "test", "en")

      expect(articles).toEqual([])
    })

    it("returns empty array for XML with no items", () => {
      const xml =
        '<?xml version="1.0"?><rss><channel><title>Empty</title></channel></rss>'
      const articles = parseRss(xml, "test", "en")

      expect(articles).toEqual([])
    })
  })

  describe("inline image extraction", () => {
    it("extracts leading img from description as fallback imageUrl", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Inline Image</title>
              <description>&lt;img src="https://example.com/inline.jpg"&gt;&lt;p&gt;Article text&lt;/p&gt;</description>
              <link>https://example.com/inline</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/inline.jpg")
      expect(articles[0].description).toBe("Article text")
    })

    it("prefers dedicated media:thumbnail over inline image", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
          <channel>
            <item>
              <title>Both Images</title>
              <description>&lt;img src="https://example.com/inline.jpg"&gt;&lt;p&gt;Text&lt;/p&gt;</description>
              <link>https://example.com/both</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
              <media:thumbnail url="https://example.com/dedicated.jpg" />
            </item>
          </channel>
        </rss>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/dedicated.jpg")
    })

    it("does not extract non-leading img from description", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>No Leading Image</title>
              <description>Text first &lt;img src="https://example.com/mid.jpg"&gt;</description>
              <link>https://example.com/no-leading</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBeUndefined()
    })

    it("extracts inline image from Atom entry summary", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Atom Inline</title>
            <summary type="html">&lt;img src="https://example.com/atom-img.jpg"&gt;&lt;p&gt;Summary text&lt;/p&gt;</summary>
            <link rel="alternate" href="https://example.com/atom-inline" />
            <published>2024-01-01T12:00:00Z</published>
          </entry>
        </feed>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/atom-img.jpg")
      expect(articles[0].description).toBe("Summary text")
    })

    it("extracts image from Atom content when summary is plain text", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Heise Article</title>
            <summary>Plain text summary</summary>
            <content type="html">&lt;p&gt;&lt;a href="https://example.com/article"&gt;&lt;img src="https://example.com/content-img.jpg" /&gt;&lt;/a&gt;&lt;/p&gt;&lt;p&gt;Article body text&lt;/p&gt;</content>
            <link rel="alternate" href="https://example.com/heise-1" />
            <published>2024-01-01T12:00:00Z</published>
          </entry>
        </feed>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/content-img.jpg")
      expect(articles[0].description).toBe("Plain text summary")
    })

    it("extracts image from Atom summary when content has no image", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Summary Image</title>
            <summary type="html">&lt;img src="https://example.com/summary-img.jpg" /&gt;&lt;p&gt;Summary text&lt;/p&gt;</summary>
            <content type="html">&lt;p&gt;Full article without leading image&lt;/p&gt;</content>
            <link rel="alternate" href="https://example.com/summary-img" />
            <published>2024-01-01T12:00:00Z</published>
          </entry>
        </feed>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/summary-img.jpg")
      expect(articles[0].description).toBe("Summary text")
    })

    it("returns undefined imageUrl when neither Atom field has an image", () => {
      const xml = `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>No Image</title>
            <summary>Plain summary</summary>
            <content type="html">&lt;p&gt;Content without image&lt;/p&gt;</content>
            <link rel="alternate" href="https://example.com/no-img" />
            <published>2024-01-01T12:00:00Z</published>
          </entry>
        </feed>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBeUndefined()
      expect(articles[0].description).toBe("Plain summary")
    })
  })

  describe("array media:content handling", () => {
    it("extracts image from single media:content element", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
          <channel>
            <item>
              <title>Single Media</title>
              <description>Content</description>
              <link>https://example.com/single-media</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
              <media:content url="https://example.com/media.jpg" medium="image" />
            </item>
          </channel>
        </rss>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/media.jpg")
    })

    it("extracts first valid URL from multiple media:content elements", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
          <channel>
            <item>
              <title>Multi Media</title>
              <description>Content</description>
              <link>https://example.com/multi-media</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
              <media:content url="https://example.com/first.jpg" medium="image" />
              <media:content url="https://example.com/second.jpg" medium="image" />
              <media:content url="https://example.com/third.jpg" medium="image" />
            </item>
          </channel>
        </rss>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBe("https://example.com/first.jpg")
    })

    it("falls through when array media:content has no valid URLs", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
          <channel>
            <item>
              <title>No URLs</title>
              <description>Content</description>
              <link>https://example.com/no-urls</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
              <media:content medium="image" />
              <media:content medium="video" />
            </item>
          </channel>
        </rss>`

      const articles = parseRss(xml, "test", "en")

      expect(articles[0].imageUrl).toBeUndefined()
    })
  })

  describe("single item handling", () => {
    it("handles single RSS item (not wrapped in array)", () => {
      const xml = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Solo</title>
              <description>Only one</description>
              <link>https://example.com/solo</link>
              <pubDate>Thu, 04 Jan 2024 12:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`

      const articles = parseRss(xml, "test", "de")

      expect(articles).toHaveLength(1)
      expect(articles[0].language).toBe("de")
    })
  })
})

describe("hashString53", () => {
  it("produces consistent output for the same input", () => {
    const result1 = hashString53("https://example.com/article-1")
    const result2 = hashString53("https://example.com/article-1")

    expect(result1).toBe(result2)
  })

  it("produces distinct output for different inputs", () => {
    const urls = [
      "https://example.com/article-1",
      "https://example.com/article-2",
      "https://example.com/article-3",
      "https://other.com/article-1",
      "https://example.com/a",
      "https://example.com/b",
    ]

    const hashes = urls.map(hashString53)
    const unique = new Set(hashes)

    expect(unique.size).toBe(urls.length)
  })

  it("returns a non-empty string", () => {
    expect(hashString53("")).toBeTruthy()
    expect(hashString53("https://example.com")).toBeTruthy()
  })

  it("handles empty string input", () => {
    const result1 = hashString53("")
    const result2 = hashString53("")

    expect(result1).toBe(result2)
  })
})
