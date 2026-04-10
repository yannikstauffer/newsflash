import { afterEach, describe, expect, it, vi } from "vitest"

import { stripHtml } from "./strip-html"

describe("stripHtml", () => {
  it("strips HTML tags from content", () => {
    expect(stripHtml("<p>Breaking <strong>news</strong> today</p>")).toBe(
      "Breaking news today",
    )
  })

  it("strips img tags and keeps surrounding text", () => {
    expect(stripHtml('<img alt="Photo" src="...">Caption text')).toBe(
      "Caption text",
    )
  })

  it("decodes HTML entities", () => {
    expect(stripHtml("Tom &amp; Jerry&#39;s adventure")).toBe(
      "Tom & Jerry's adventure",
    )
  })

  it("returns plain text unchanged", () => {
    expect(stripHtml("No HTML here")).toBe("No HTML here")
  })

  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("")
  })

  it("returns empty string for undefined-like input", () => {
    expect(stripHtml(undefined as unknown as string)).toBe("")
    expect(stripHtml(null as unknown as string)).toBe("")
  })

  it("collapses whitespace from multi-line HTML", () => {
    expect(stripHtml("<p>Line one</p>\n\n<p>Line two</p>")).toBe(
      "Line one Line two",
    )
  })

  it("handles complex nested HTML with links and images", () => {
    const html =
      '<a href="https://example.com"><img hspace="5" border="0" align="left" alt="Chip">Some description text</a>'
    expect(stripHtml(html)).toBe("Some description text")
  })

  describe("without DOMParser (service worker context)", () => {
    const originalDOMParser = globalThis.DOMParser

    afterEach(() => {
      globalThis.DOMParser = originalDOMParser
    })

    it("returns raw HTML when DOMParser is unavailable", () => {
      vi.stubGlobal("DOMParser", undefined)

      expect(stripHtml("<p>Hello &amp; world</p>")).toBe(
        "<p>Hello &amp; world</p>",
      )
    })

    it("returns empty string for empty input without DOMParser", () => {
      vi.stubGlobal("DOMParser", undefined)

      expect(stripHtml("")).toBe("")
    })
  })
})
