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
})
