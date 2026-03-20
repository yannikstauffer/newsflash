import { XMLParser } from "fast-xml-parser"

import type { NormalizedArticle } from "./types"

import { extractLeadingImage } from "@/utils/extract-leading-image"
import { stripHtml } from "@/utils/strip-html"

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
})

export function hashString53(input: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let index = 0; index < input.length; index++) {
    const char = input.codePointAt(index) ?? 0
    h1 = Math.imul(h1 ^ char, 2654435761)
    h2 = Math.imul(h2 ^ char, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return combined.toString(36)
}

function parseDate(dateString: string | undefined): Date {
  if (!dateString) {
    return new Date(0)
  }
  const parsed = new Date(dateString)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

function extractText(value: unknown): string {
  if (typeof value === "string") {
    return value
  }
  if (value && typeof value === "object" && "#text" in value) {
    return String((value as Record<string, unknown>)["#text"])
  }
  return ""
}

interface RssItem {
  title?: unknown
  description?: unknown
  link?: unknown
  pubDate?: string
  "media:thumbnail"?: { "@_url"?: string }
  "media:content"?: { "@_url"?: string } | Array<{ "@_url"?: string }>
  enclosure?: { "@_url"?: string; "@_type"?: string }
  category?: unknown
}

interface AtomEntry {
  title?: unknown
  summary?: unknown
  content?: unknown
  link?: unknown
  updated?: string
  published?: string
  category?: unknown
  "media:thumbnail"?: { "@_url"?: string }
}

function extractAtomLink(link: unknown): string {
  if (typeof link === "string") {
    return link
  }
  if (Array.isArray(link)) {
    const alternate = link.find(
      (l: Record<string, unknown>) =>
        l["@_rel"] === "alternate" || !l["@_rel"],
    )
    return alternate ? String(alternate["@_href"] ?? "") : String(link[0]?.["@_href"] ?? "")
  }
  if (link && typeof link === "object" && "@_href" in link) {
    return String((link as Record<string, unknown>)["@_href"])
  }
  return ""
}

function extractImageUrl(item: RssItem | AtomEntry): string | undefined {
  if ("media:thumbnail" in item && item["media:thumbnail"]?.["@_url"]) {
    return item["media:thumbnail"]["@_url"]
  }
  if ("media:content" in item) {
    const media = item["media:content"]
    if (Array.isArray(media)) {
      const first = media.find((m) => m["@_url"])
      if (first?.["@_url"]) {
        return first["@_url"]
      }
    } else if (media?.["@_url"]) {
      return media["@_url"]
    }
  }
  if ("enclosure" in item) {
    const enclosure = item.enclosure
    if (enclosure?.["@_type"]?.startsWith("image/")) {
      return enclosure["@_url"]
    }
  }
  return undefined
}

function extractCategory(category: unknown): string | undefined {
  if (typeof category === "string") {
    return category
  }
  if (Array.isArray(category)) {
    const first = category[0]
    return typeof first === "string"
      ? first
      : extractText(first)
  }
  if (category && typeof category === "object") {
    return extractText(category)
  }
  return undefined
}

function parseRssItems(
  items: RssItem[],
  source: string,
  language: "de" | "en",
): NormalizedArticle[] {
  return items.map((item) => {
    const link = extractText(item.link)
    const dedicatedImage = extractImageUrl(item)
    const descriptionHtml = extractText(item.description)
    const { imageUrl: inlineImage, html: cleanedHtml } =
      extractLeadingImage(descriptionHtml)
    return {
      id: `${source}:${hashString53(link)}`,
      title: extractText(item.title),
      description: stripHtml(dedicatedImage ? descriptionHtml : cleanedHtml),
      link,
      publishedAt: parseDate(item.pubDate),
      source,
      language,
      imageUrl: dedicatedImage ?? inlineImage,
      category: extractCategory(item.category),
    }
  })
}

function extractAtomInlineImage(
  entry: AtomEntry,
): { imageUrl: string | undefined; descriptionHtml: string } {
  const contentHtml = extractText(entry.content)
  const summaryHtml = extractText(entry.summary)
  const descriptionSource = summaryHtml || contentHtml

  if (contentHtml) {
    const result = extractLeadingImage(contentHtml)
    if (result.imageUrl) {
      return { imageUrl: result.imageUrl, descriptionHtml: descriptionSource }
    }
  }

  if (summaryHtml) {
    const result = extractLeadingImage(summaryHtml)
    if (result.imageUrl) {
      return { imageUrl: result.imageUrl, descriptionHtml: result.html }
    }
  }

  return { imageUrl: undefined, descriptionHtml: descriptionSource }
}

function parseAtomEntries(
  entries: AtomEntry[],
  source: string,
  language: "de" | "en",
): NormalizedArticle[] {
  return entries.map((entry) => {
    const link = extractAtomLink(entry.link)
    const dedicatedImage = extractImageUrl(entry)
    const { imageUrl: inlineImage, descriptionHtml } =
      extractAtomInlineImage(entry)
    return {
      id: `${source}:${hashString53(link)}`,
      title: extractText(entry.title),
      description: stripHtml(
        dedicatedImage
          ? extractText(entry.summary ?? entry.content)
          : descriptionHtml,
      ),
      link,
      publishedAt: parseDate(entry.published ?? entry.updated),
      source,
      language,
      imageUrl: dedicatedImage ?? inlineImage,
      category: extractCategory(entry.category),
    }
  })
}

export function parseRss(
  xml: string,
  source: string,
  language: "de" | "en",
): NormalizedArticle[] {
  try {
    const parsed = parser.parse(xml)

    // RSS 2.0
    const rssItems = parsed?.rss?.channel?.item
    if (rssItems) {
      const items = Array.isArray(rssItems) ? rssItems : [rssItems]
      return parseRssItems(items, source, language)
    }

    // Atom
    const atomEntries = parsed?.feed?.entry
    if (atomEntries) {
      const entries = Array.isArray(atomEntries) ? atomEntries : [atomEntries]
      return parseAtomEntries(entries, source, language)
    }

    return []
  } catch {
    return []
  }
}
