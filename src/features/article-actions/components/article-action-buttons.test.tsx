import { render, screen } from "@testing-library/react"
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
})
