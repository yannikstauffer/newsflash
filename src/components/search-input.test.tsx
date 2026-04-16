import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SearchInput } from "./search-input"

describe("SearchInput", () => {
  it("renders desktop input and mobile open-search button by default", () => {
    render(<SearchInput value="" onChange={() => {}} aria-label="Search articles" />)

    const inputs = screen.getAllByRole("searchbox", { name: "Search articles" })
    expect(inputs.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole("button", { name: "Open search" })).toBeInTheDocument()
  })

  it("calls onChange when desktop input changes", () => {
    const onChange = vi.fn()
    render(<SearchInput value="" onChange={onChange} aria-label="Search" />)

    const [desktopInput] = screen.getAllByRole("searchbox")
    fireEvent.change(desktopInput!, { target: { value: "news" } })
    expect(onChange).toHaveBeenCalledWith("news")
  })

  it("clears value on desktop clear button click", () => {
    const onChange = vi.fn()
    render(<SearchInput value="foo" onChange={onChange} aria-label="Search" />)

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(onChange).toHaveBeenCalledWith("")
  })

  it("expands mobile input when open-search clicked", () => {
    render(<SearchInput value="" onChange={() => {}} aria-label="Search" />)

    fireEvent.click(screen.getByRole("button", { name: "Open search" }))
    expect(screen.queryByRole("button", { name: "Open search" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Close search" })).toBeInTheDocument()
  })

  it("collapses mobile input on Escape", () => {
    render(<SearchInput value="" onChange={() => {}} aria-label="Search" />)

    fireEvent.click(screen.getByRole("button", { name: "Open search" }))
    const mobileInputs = screen.getAllByRole("searchbox")
    fireEvent.keyDown(mobileInputs[0]!, { key: "Escape" })
    expect(screen.getByRole("button", { name: "Open search" })).toBeInTheDocument()
  })

  it("mobile clear clears value first, then collapses", () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <SearchInput value="foo" onChange={onChange} aria-label="Search" />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Open search" }))
    const clearButtons = screen.getAllByRole("button", { name: "Clear search" })
    fireEvent.click(clearButtons[0]!)
    expect(onChange).toHaveBeenCalledWith("")

    rerender(<SearchInput value="" onChange={onChange} aria-label="Search" />)
    fireEvent.click(screen.getByRole("button", { name: "Close search" }))
    expect(screen.getByRole("button", { name: "Open search" })).toBeInTheDocument()
  })
})
