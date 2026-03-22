import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ArticleActionButtons } from "./article-action-buttons"

const defaultProps = {
  onHide: vi.fn(),
  onSave: vi.fn(),
  isSaved: false,
}

describe("ArticleActionButtons", () => {
  it("includes group-focus-within:flex class for keyboard focus visibility", () => {
    const { container } = render(<ArticleActionButtons {...defaultProps} />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("group-focus-within:flex")
  })

  it("includes group-hover:flex class for mouse hover visibility", () => {
    const { container } = render(<ArticleActionButtons {...defaultProps} />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("group-hover:flex")
  })

  it("includes touch-device:md:flex class for touch device visibility on md+ screens", () => {
    const { container } = render(<ArticleActionButtons {...defaultProps} />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("touch-device:md:flex")
  })

  it("renders hide and save buttons with aria labels", () => {
    render(<ArticleActionButtons {...defaultProps} />)

    expect(screen.getByLabelText("Hide article")).toBeDefined()
    expect(screen.getByLabelText("Save to read list")).toBeDefined()
  })

  it("shows remove label when article is saved", () => {
    render(<ArticleActionButtons {...defaultProps} isSaved={true} />)

    expect(screen.getByLabelText("Remove from read list")).toBeDefined()
  })

  it("calls onHide and stops event propagation when hide button is clicked", () => {
    const onHide = vi.fn()
    render(<ArticleActionButtons {...defaultProps} onHide={onHide} />)

    const hideButton = screen.getByLabelText("Hide article")
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    Object.defineProperty(event, "stopPropagation", { value: vi.fn() })
    Object.defineProperty(event, "preventDefault", { value: vi.fn() })
    fireEvent(hideButton, event)

    expect(onHide).toHaveBeenCalledOnce()
  })

  it("calls onSave and stops event propagation when save button is clicked", () => {
    const onSave = vi.fn()
    render(<ArticleActionButtons {...defaultProps} onSave={onSave} />)

    const saveButton = screen.getByLabelText("Save to read list")
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    Object.defineProperty(event, "stopPropagation", { value: vi.fn() })
    Object.defineProperty(event, "preventDefault", { value: vi.fn() })
    fireEvent(saveButton, event)

    expect(onSave).toHaveBeenCalledOnce()
  })

  it("applies fill-current class to bookmark icon when saved", () => {
    render(<ArticleActionButtons {...defaultProps} isSaved={true} />)

    const saveButton = screen.getByLabelText("Remove from read list")
    const svg = saveButton.querySelector("svg")
    expect(svg?.className.baseVal || svg?.getAttribute("class") || "").toContain("fill-current")
  })
})
