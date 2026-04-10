import { fireEvent, render, screen } from "@testing-library/react"
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

  it("hides image and switches to single-column layout when image fails to load", () => {
    const { container } = render(
      <ArticleCard
        article={makeArticle({ imageUrl: "https://example.com/broken.jpg" })}
      />,
    )

    const img = container.querySelector("img")
    expect(img).toBeInTheDocument()

    const articleBefore = screen.getByRole("article")
    expect(articleBefore.className).toContain("grid-cols-[auto_1fr]")

    fireEvent.error(img!)

    const articleAfter = screen.getByRole("article")
    expect(articleAfter.className).toContain("grid-cols-1")
    expect(articleAfter.className).not.toContain("grid-cols-[auto_1fr]")
    expect(container.querySelector("img")).not.toBeInTheDocument()
  })

  it("renders without image when no imageUrl is provided", () => {
    const { container } = render(
      <ArticleCard article={makeArticle({ imageUrl: undefined })} />,
    )

    expect(container.querySelector("img")).not.toBeInTheDocument()
    const article = screen.getByRole("article")
    expect(article.className).toContain("grid-cols-1")
  })
})
