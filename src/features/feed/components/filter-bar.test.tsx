import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FilterBar } from "./filter-bar"

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
  articleCount: 42,
  hiddenCount: 3,
}

describe("FilterBar", () => {
  // 7.5 Updated existing tests for new prop interface (articleCount, hiddenCount)

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

  it("displays last refreshed timestamp when provided", () => {
    const lastRefreshedAt = new Date()
    render(<FilterBar {...defaultProps} lastRefreshedAt={lastRefreshedAt} />)

    const refreshedElements = screen.getAllByLabelText("Last refreshed")
    expect(refreshedElements.length).toBeGreaterThan(0)
    expect(refreshedElements[0].textContent).toContain("Refreshed")
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
      const svgInButton = allArticlesButton.querySelector("svg")
      expect(svgInButton).toBeDefined()
      expect(svgInButton).not.toBeNull()
    })

    it("wraps button text in span with hidden md:inline class", () => {
      render(<FilterBar {...defaultProps} />)

      const allArticlesButton = screen.getByRole("button", { name: "All articles" })
      const textSpan = allArticlesButton.querySelector("span.hidden")
      expect(textSpan).not.toBeNull()
      expect(textSpan?.classList.contains("md:inline")).toBe(true)
      expect(textSpan?.textContent).toBe("All articles")
    })

    it("wraps Hidden button text in span with hidden md:inline class", () => {
      render(<FilterBar {...defaultProps} />)

      const hiddenButton = screen.getByRole("button", { name: /hidden/i })
      const textSpan = hiddenButton.querySelector("span.hidden")
      expect(textSpan).not.toBeNull()
      expect(textSpan?.classList.contains("md:inline")).toBe(true)
      expect(textSpan?.textContent).toBe("Hidden")
    })

    it("has aria-label on All articles button for screen reader accessibility", () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByRole("button", { name: "All articles" }).getAttribute("aria-label")).toBe(
        "All articles",
      )
    })

    it("has aria-label on Hidden button for screen reader accessibility", () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByRole("button", { name: /hidden/i }).getAttribute("aria-label")).toBe("Hidden")
    })
  })

  // 7.2 Article count display tests
  describe("article count display", () => {
    it("shows article count in normal mode", () => {
      render(<FilterBar {...defaultProps} articleCount={42} hiddenCount={3} showHidden={false} />)

      const countElements = screen.getAllByLabelText("Article count")
      expect(countElements.some((element) => element.textContent === "42 articles")).toBe(true)
    })

    it("shows article count with hidden annotation when showHidden is active", () => {
      render(<FilterBar {...defaultProps} articleCount={42} hiddenCount={3} showHidden={true} />)

      const countElements = screen.getAllByLabelText("Article count")
      expect(countElements.some((element) => element.textContent === "42 + 3 hidden")).toBe(true)
    })

    it("shows zero article count", () => {
      render(<FilterBar {...defaultProps} articleCount={0} hiddenCount={0} showHidden={false} />)

      const countElements = screen.getAllByLabelText("Article count")
      expect(countElements.some((element) => element.textContent === "0 articles")).toBe(true)
    })
  })

  // 7.3 Search expand/collapse and clear button tests
  describe("search expand/collapse", () => {
    it("renders search icon button to open search", () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByRole("button", { name: "Open search" })).toBeDefined()
    })

    it("shows mobile search input when search is opened", () => {
      render(<FilterBar {...defaultProps} />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))

      // After opening, the mobile search input should be visible
      const searchInputs = screen.getAllByLabelText("Search articles")
      expect(searchInputs.length).toBeGreaterThan(0)
    })

    it("shows close search button when mobile search is expanded with empty query", () => {
      render(<FilterBar {...defaultProps} />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))

      expect(screen.getByLabelText("Close search")).toBeDefined()
    })

    it("shows clear search button when mobile search is expanded with text", () => {
      render(<FilterBar {...defaultProps} searchQuery="test" />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))

      const clearButtons = screen.getAllByLabelText("Clear search")
      expect(clearButtons.length).toBeGreaterThan(0)
    })

    it("calls onSearchChange with empty string when clear is clicked with text", () => {
      const onSearchChange = vi.fn()
      render(<FilterBar {...defaultProps} searchQuery="test" onSearchChange={onSearchChange} />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))
      // Click the first clear button (mobile one)
      const clearButtons = screen.getAllByLabelText("Clear search")
      fireEvent.click(clearButtons[0])

      expect(onSearchChange).toHaveBeenCalledWith("")
    })

    it("collapses mobile search when close is clicked with empty text", () => {
      render(<FilterBar {...defaultProps} searchQuery="" />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))
      fireEvent.click(screen.getByLabelText("Close search"))

      // After collapsing, the Open search button should be back
      expect(screen.getByRole("button", { name: "Open search" })).toBeDefined()
    })

    it("collapses mobile search on Escape key", () => {
      render(<FilterBar {...defaultProps} searchQuery="" />)

      fireEvent.click(screen.getByRole("button", { name: "Open search" }))

      const searchInput = screen.getAllByLabelText("Search articles")[0]
      fireEvent.keyDown(searchInput, { key: "Escape" })

      // After escape, the Open search button should be back
      expect(screen.getByRole("button", { name: "Open search" })).toBeDefined()
    })

    it("shows accent style on search icon when search query is active", () => {
      render(<FilterBar {...defaultProps} searchQuery="test" />)

      const searchButton = screen.getByRole("button", { name: "Open search" })
      expect(searchButton.className).toContain("bg-accent")
    })

    it("does not show accent style on search icon when search query is empty", () => {
      render(<FilterBar {...defaultProps} searchQuery="" />)

      const searchButton = screen.getByRole("button", { name: "Open search" })
      expect(searchButton.className).not.toContain("bg-accent")
    })

    it("shows desktop clear button when search query has text", () => {
      render(<FilterBar {...defaultProps} searchQuery="test" />)

      // Desktop clear button exists (may be hidden via CSS)
      const clearButtons = screen.getAllByLabelText("Clear search")
      expect(clearButtons.length).toBeGreaterThan(0)
    })
  })

  // 7.4 Two-row layout and day navigation positioning
  describe("two-row layout", () => {
    it("uses flex-col layout for the outer wrapper", () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const outerDiv = container.firstElementChild as HTMLElement
      expect(outerDiv.className).toContain("flex-col")
    })

    it("renders day navigation in a separate row from toggle buttons", () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const outerDiv = container.firstElementChild as HTMLElement
      // The outer div should have at least 2 direct children (row 1 and row 2)
      expect(outerDiv.children.length).toBeGreaterThanOrEqual(2)
    })

    it("centers day navigation row", () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const outerDiv = container.firstElementChild as HTMLElement
      // Last direct child should be the day navigation row with justify-center
      const lastChild = outerDiv.lastElementChild as HTMLElement
      expect(lastChild.className).toContain("justify-center")
    })

    it("does not render day navigation row when allArticles is true", () => {
      const { container } = render(<FilterBar {...defaultProps} allArticles={true} />)

      const outerDiv = container.firstElementChild as HTMLElement
      // Should only have the row 1 div
      expect(outerDiv.children.length).toBe(1)
    })
  })

  // Additional test for search input onChange on desktop
  it("calls onSearchChange when typing in desktop search input", () => {
    const onSearchChange = vi.fn()
    render(<FilterBar {...defaultProps} onSearchChange={onSearchChange} />)

    // The desktop search input (there may be multiple, pick one that's in the DOM)
    const searchInputs = screen.getAllByLabelText("Search articles")
    fireEvent.change(searchInputs[0], { target: { value: "test" } })

    expect(onSearchChange).toHaveBeenCalledWith("test")
  })
})
