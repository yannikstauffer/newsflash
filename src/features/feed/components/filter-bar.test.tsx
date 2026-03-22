import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FilterBar } from "./filter-bar"

vi.mock("@/features/article-actions", () => ({
  useArticleState: () => ({
    unhideArticles: vi.fn(),
  }),
}))

const defaultProps = {
  showHidden: false,
  onToggleShowHidden: vi.fn(),
  searchQuery: "",
  onSearchChange: vi.fn(),
  selectedDate: new Date("2026-03-20"),
  allArticles: false,
  isToday: true,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onToggleAllArticles: vi.fn(),
  lastRefreshedAt: null as Date | null,
  articleCount: 10,
  hiddenCount: 0,
  onHideAll: vi.fn(),
  visibleArticleIds: ["a1", "a2", "a3"],
}

describe("FilterBar", () => {
  it("renders All articles toggle, Hidden toggle, day nav, and search", () => {
    render(<FilterBar {...defaultProps} />)

    expect(screen.getByRole("button", { name: "All articles" })).toBeDefined()
    expect(screen.getByRole("button", { name: /hidden/i })).toBeDefined()
    expect(screen.getByLabelText("Previous day")).toBeDefined()
    expect(screen.getByLabelText("Next day")).toBeDefined()
    expect(screen.getByLabelText("Search articles")).toBeDefined()
  })

  it("hides day navigation when allArticles is active", () => {
    render(<FilterBar {...defaultProps} allArticles={true} />)

    expect(screen.queryByLabelText("Previous day")).toBeNull()
    expect(screen.queryByLabelText("Next day")).toBeNull()
  })

  it("disables next day button when isToday is true", () => {
    render(<FilterBar {...defaultProps} isToday={true} />)

    expect(screen.getByLabelText("Next day").hasAttribute("disabled")).toBe(true)
  })

  it("enables next day button when isToday is false", () => {
    render(<FilterBar {...defaultProps} isToday={false} />)

    expect(screen.getByLabelText("Next day").hasAttribute("disabled")).toBe(false)
  })

  it("calls onPrev when previous day button is clicked", () => {
    const onPrevious = vi.fn()
    render(<FilterBar {...defaultProps} onPrev={onPrevious} />)

    fireEvent.click(screen.getByLabelText("Previous day"))

    expect(onPrevious).toHaveBeenCalledOnce()
  })

  it("calls onToggleAllArticles when All articles button is clicked", () => {
    const onToggleAllArticles = vi.fn()
    render(<FilterBar {...defaultProps} onToggleAllArticles={onToggleAllArticles} />)

    fireEvent.click(screen.getByRole("button", { name: "All articles" }))

    expect(onToggleAllArticles).toHaveBeenCalledOnce()
  })

  it("calls onToggleShowHidden when Hidden button is clicked", () => {
    const onToggleShowHidden = vi.fn()
    render(<FilterBar {...defaultProps} onToggleShowHidden={onToggleShowHidden} />)

    fireEvent.click(screen.getByRole("button", { name: /hidden/i }))

    expect(onToggleShowHidden).toHaveBeenCalledOnce()
  })

  it("renders All articles toggle before Hidden toggle", () => {
    render(<FilterBar {...defaultProps} />)

    const allArticlesButton = screen.getByRole("button", { name: "All articles" })
    const hiddenButton = screen.getByRole("button", { name: /hidden/i })

    expect(
      allArticlesButton.compareDocumentPosition(hiddenButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("renders Previous day button before Next day button (left-to-right)", () => {
    render(<FilterBar {...defaultProps} />)

    const previousDayButton = screen.getByLabelText("Previous day")
    const nextDayButton = screen.getByLabelText("Next day")

    expect(
      previousDayButton.compareDocumentPosition(nextDayButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("sets aria-pressed on All articles toggle when active", () => {
    render(<FilterBar {...defaultProps} allArticles={true} />)

    expect(screen.getByRole("button", { name: "All articles" }).getAttribute("aria-pressed")).toBe("true")
  })

  it("sets aria-pressed on Hidden toggle when active", () => {
    render(<FilterBar {...defaultProps} showHidden={true} />)

    expect(screen.getByRole("button", { name: /hidden/i }).getAttribute("aria-pressed")).toBe("true")
  })

  it("calls onNext when next day button is clicked", () => {
    const onNext = vi.fn()
    render(<FilterBar {...defaultProps} isToday={false} onNext={onNext} />)

    fireEvent.click(screen.getByLabelText("Next day"))

    expect(onNext).toHaveBeenCalledOnce()
  })

  it("has maxLength of 200 on the search input", () => {
    render(<FilterBar {...defaultProps} />)

    expect(screen.getByLabelText("Search articles").getAttribute("maxlength")).toBe("200")
  })

  it("calls onSearchChange when typing in search input", () => {
    const onSearchChange = vi.fn()
    render(<FilterBar {...defaultProps} onSearchChange={onSearchChange} />)

    fireEvent.change(screen.getByLabelText("Search articles"), { target: { value: "test" } })

    expect(onSearchChange).toHaveBeenCalledWith("test")
  })

  it("displays last refreshed timestamp when provided", () => {
    const lastRefreshedAt = new Date()
    render(<FilterBar {...defaultProps} lastRefreshedAt={lastRefreshedAt} />)

    expect(screen.getByLabelText("Last refreshed")).toBeDefined()
    expect(screen.getByLabelText("Last refreshed").textContent).toContain("Refreshed")
  })

  it("does not display last refreshed timestamp when null", () => {
    render(<FilterBar {...defaultProps} lastRefreshedAt={null} />)

    expect(screen.queryByLabelText("Last refreshed")).toBeNull()
  })

  // 7.1 Icon-only rendering tests
  describe("icon-only buttons", () => {
    it("renders List icon in All articles button", () => {
      render(<FilterBar {...defaultProps} />)

      const allArticlesButton = screen.getByRole("button", { name: "All articles" })
      expect(allArticlesButton.querySelector("svg")).toBeDefined()
    })

    it("renders Eye/EyeOff icon in Hidden button", () => {
      render(<FilterBar {...defaultProps} />)

      const hiddenButton = screen.getByRole("button", { name: /hidden/i })
      expect(hiddenButton.querySelector("svg")).toBeDefined()
    })

    it("wraps button text in span with hidden md:inline class", () => {
      render(<FilterBar {...defaultProps} />)

      const allArticlesButton = screen.getByRole("button", { name: "All articles" })
      const textSpan = allArticlesButton.querySelector("span")
      expect(textSpan).not.toBeNull()
      expect(textSpan?.className).toContain("hidden")
      expect(textSpan?.className).toContain("md:inline")
    })

    it("has aria-label on All articles button", () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByRole("button", { name: "All articles" }).getAttribute("aria-label")).toBe("All articles")
    })

    it("has aria-label on Hidden button", () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByRole("button", { name: /hidden/i }).getAttribute("aria-label")).toBe("Hidden")
    })
  })

  // 7.2 Article count display tests
  describe("article count", () => {
    it("displays article count normally", () => {
      render(<FilterBar {...defaultProps} articleCount={14} />)

      expect(screen.getByLabelText("Article count").textContent).toBe("14 articles")
    })

    it("displays zero articles", () => {
      render(<FilterBar {...defaultProps} articleCount={0} />)

      expect(screen.getByLabelText("Article count").textContent).toBe("0 articles")
    })

    it("displays hidden annotation when showHidden is active", () => {
      render(
        <FilterBar
          {...defaultProps}
          showHidden={true}
          articleCount={14}
          hiddenCount={3}
        />,
      )

      expect(screen.getByLabelText("Article count").textContent).toBe("14 + 3 hidden")
    })

    it("displays normal count when showHidden is active but hiddenCount is zero", () => {
      render(
        <FilterBar
          {...defaultProps}
          showHidden={true}
          articleCount={14}
          hiddenCount={0}
        />,
      )

      expect(screen.getByLabelText("Article count").textContent).toBe("14 articles")
    })
  })

  // 7.3 Search expand/collapse and clear button tests
  describe("search expand/collapse", () => {
    it("renders search icon button for mobile", () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByRole("button", { name: "Open search" })).toBeDefined()
    })

    it("expands mobile search when icon button is clicked", () => {
      render(<FilterBar {...defaultProps} />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))

      // After expanding, the clear button should be visible
      expect(screen.getByRole("button", { name: "Clear search" })).toBeDefined()
    })

    it("hides status and toggles when mobile search is open", () => {
      render(<FilterBar {...defaultProps} lastRefreshedAt={new Date()} />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))

      // Status text should not be visible (hidden by conditional rendering)
      expect(screen.queryByLabelText("Last refreshed")).toBeNull()
      expect(screen.queryByRole("button", { name: "All articles" })).toBeNull()
    })

    it("clears search text when clear button is clicked with text", () => {
      const onSearchChange = vi.fn()
      render(
        <FilterBar
          {...defaultProps}
          searchQuery="test"
          onSearchChange={onSearchChange}
        />,
      )

      // Expand search first
      fireEvent.click(screen.getByRole("button", { name: "Open search" }))
      // Both mobile and desktop clear buttons exist in DOM; click the first (mobile)
      const clearButtons = screen.getAllByRole("button", { name: "Clear search" })
      fireEvent.click(clearButtons[0])

      expect(onSearchChange).toHaveBeenCalledWith("")
    })

    it("collapses search when Escape is pressed on mobile", () => {
      render(<FilterBar {...defaultProps} />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))

      // Search should be open
      const searchInputs = screen.getAllByLabelText("Search articles")
      fireEvent.keyDown(searchInputs[0], { key: "Escape" })

      // Should be collapsed again - open search button should be back
      expect(screen.getByRole("button", { name: "Open search" })).toBeDefined()
    })

    it("shows accent color on search icon when query is active", () => {
      render(<FilterBar {...defaultProps} searchQuery="active query" />)

      const searchButton = screen.getByRole("button", { name: "Open search" })
      expect(searchButton.className).toContain("border-primary")
      expect(searchButton.className).toContain("text-primary")
    })

    it("does not show accent on search icon when query is empty", () => {
      render(<FilterBar {...defaultProps} searchQuery="" />)

      const searchButton = screen.getByRole("button", { name: "Open search" })
      expect(searchButton.className).not.toContain("border-primary")
    })
  })

  // 7.4 Two-row layout and day navigation positioning
  describe("two-row layout", () => {
    it("renders day navigation in a separate row from toggles", () => {
      const { container } = render(<FilterBar {...defaultProps} allArticles={false} />)

      // The outer wrapper should be flex-col
      const outerDiv = container.firstChild as HTMLElement
      expect(outerDiv.className).toContain("flex-col")
    })

    it("centers day navigation in row 2", () => {
      const { container } = render(<FilterBar {...defaultProps} allArticles={false} />)

      const outerDiv = container.firstChild as HTMLElement
      const row2 = outerDiv.children[1] as HTMLElement
      expect(row2.className).toContain("justify-center")
    })

    it("does not render row 2 when allArticles is active", () => {
      const { container } = render(<FilterBar {...defaultProps} allArticles={true} />)

      const outerDiv = container.firstChild as HTMLElement
      // Only row 1 should exist
      expect(outerDiv.children.length).toBe(1)
    })
  })
})
