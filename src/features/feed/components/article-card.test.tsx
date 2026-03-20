import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ArticleCard } from "./article-card"

import type { NormalizedArticle } from "@/features/connectors/types"

function makeArticle(
  overrides: Partial<NormalizedArticle> = {},
): NormalizedArticle {
  return {
    id: "test:1",
    title: "Test Article",
    description: "A test description",
    link: "https://example.com/article",
    publishedAt: new Date("2026-03-20T10:00:00Z"),
    source: "test",
    language: "en",
    ...overrides,
  }
}

describe("ArticleCard", () => {
  it("renders with tabindex 0 for keyboard focusability", () => {
    render(<ArticleCard article={makeArticle()} />)

    const article = screen.getByRole("article")
    expect(article.getAttribute("tabindex")).toBe("0")
  })

  it("includes focus-within ring classes for visible focus indicator", () => {
    render(<ArticleCard article={makeArticle()} />)

    const article = screen.getByRole("article")
    expect(article.className).toContain("focus-within:ring-2")
    expect(article.className).toContain("focus-within:ring-ring")
  })

  it("has the group class for group-focus-within support", () => {
    render(<ArticleCard article={makeArticle()} />)

    const article = screen.getByRole("article")
    expect(article.className).toContain("group")
  })
})
