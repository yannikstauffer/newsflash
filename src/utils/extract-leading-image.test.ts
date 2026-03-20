import { describe, expect, it } from "vitest"

import { extractLeadingImage } from "./extract-leading-image"

describe("extractLeadingImage", () => {
  it("extracts img at the start of HTML", () => {
    const result = extractLeadingImage(
      '<img src="https://example.com/photo.jpg"><p>Article text</p>',
    )

    expect(result.imageUrl).toBe("https://example.com/photo.jpg")
    expect(result.html).not.toContain("<img")
    expect(result.html).toContain("Article text")
  })

  it("extracts img wrapped in a <p> tag", () => {
    const result = extractLeadingImage(
      '<p><img src="https://example.com/photo.jpg"></p><p>Article text</p>',
    )

    expect(result.imageUrl).toBe("https://example.com/photo.jpg")
    expect(result.html).not.toContain("<img")
    expect(result.html).toContain("Article text")
  })

  it("does not extract img after text content", () => {
    const result = extractLeadingImage(
      'Some text first <img src="https://example.com/photo.jpg">',
    )

    expect(result.imageUrl).toBeUndefined()
  })

  it("returns undefined imageUrl when no img is present", () => {
    const result = extractLeadingImage("<p>Just text content</p>")

    expect(result.imageUrl).toBeUndefined()
    expect(result.html).toContain("Just text content")
  })

  it("extracts img when whitespace precedes it", () => {
    const result = extractLeadingImage(
      '   \n  <img src="https://example.com/photo.jpg"><p>Text</p>',
    )

    expect(result.imageUrl).toBe("https://example.com/photo.jpg")
    expect(result.html).not.toContain("<img")
  })

  it("returns original html for empty input", () => {
    const result = extractLeadingImage("")

    expect(result.imageUrl).toBeUndefined()
    expect(result.html).toBe("")
  })

  it("does not extract img without src attribute", () => {
    const result = extractLeadingImage("<img><p>Text</p>")

    expect(result.imageUrl).toBeUndefined()
  })

  it("extracts img wrapped in <a> at top level", () => {
    const result = extractLeadingImage(
      '<a href="https://example.com/article"><img src="https://example.com/photo.jpg" /></a><p>Article text</p>',
    )

    expect(result.imageUrl).toBe("https://example.com/photo.jpg")
    expect(result.html).not.toContain("<img")
    expect(result.html).not.toContain("<a")
    expect(result.html).toContain("Article text")
  })

  it("extracts img wrapped in <a> inside <p>", () => {
    const result = extractLeadingImage(
      '<p><a href="https://example.com/article"><img src="https://example.com/photo.jpg" /></a></p><p>Article text</p>',
    )

    expect(result.imageUrl).toBe("https://example.com/photo.jpg")
    expect(result.html).not.toContain("<img")
    expect(result.html).not.toContain("<a")
    expect(result.html).toContain("Article text")
  })

  it("removes parent <p> when extracting anchor-wrapped image leaves it empty", () => {
    const result = extractLeadingImage(
      '<p><a href="https://example.com"><img src="https://example.com/photo.jpg" /></a></p><p>Remaining</p>',
    )

    expect(result.imageUrl).toBe("https://example.com/photo.jpg")
    // The first <p> should be fully removed since it only contained the <a><img></a>
    expect(result.html).toBe("<p>Remaining</p>")
  })

  it("does not extract img inside a <p> with text", () => {
    const result = extractLeadingImage(
      '<p>Caption <img src="https://example.com/photo.jpg"></p>',
    )

    expect(result.imageUrl).toBeUndefined()
  })
})
