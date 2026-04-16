import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SegmentedControl } from "./segmented-control"

const OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
] as const

describe("SegmentedControl", () => {
  it("renders a radiogroup with all options", () => {
    render(
      <SegmentedControl
        value="a"
        onChange={() => {}}
        options={OPTIONS}
        aria-label="Test"
      />,
    )

    const group = screen.getByRole("radiogroup", { name: "Test" })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(3)
  })

  it("marks the selected option aria-checked and tabbable", () => {
    render(
      <SegmentedControl
        value="b"
        onChange={() => {}}
        options={OPTIONS}
        aria-label="Test"
      />,
    )

    const b = screen.getByRole("radio", { name: "B" })
    expect(b).toHaveAttribute("aria-checked", "true")
    expect(b).toHaveAttribute("tabindex", "0")

    const a = screen.getByRole("radio", { name: "A" })
    expect(a).toHaveAttribute("tabindex", "-1")
  })

  it("calls onChange when an option is clicked", () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl
        value="a"
        onChange={onChange}
        options={OPTIONS}
        aria-label="Test"
      />,
    )

    fireEvent.click(screen.getByRole("radio", { name: "B" }))
    expect(onChange).toHaveBeenCalledWith("b")
  })

  it("cycles with ArrowRight (wrapping)", () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl
        value="c"
        onChange={onChange}
        options={OPTIONS}
        aria-label="Test"
      />,
    )

    fireEvent.keyDown(screen.getByRole("radio", { name: "C" }), { key: "ArrowRight" })
    expect(onChange).toHaveBeenCalledWith("a")
  })

  it("cycles with ArrowLeft (wrapping)", () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl
        value="a"
        onChange={onChange}
        options={OPTIONS}
        aria-label="Test"
      />,
    )

    fireEvent.keyDown(screen.getByRole("radio", { name: "A" }), { key: "ArrowLeft" })
    expect(onChange).toHaveBeenCalledWith("c")
  })

  it("moves focus to the newly selected option on ArrowRight", () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl
        value="a"
        onChange={onChange}
        options={OPTIONS}
        aria-label="Test"
      />,
    )

    const a = screen.getByRole("radio", { name: "A" })
    a.focus()
    fireEvent.keyDown(a, { key: "ArrowRight" })
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "B" }))
  })

  it("jumps to first with Home and last with End", () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl
        value="b"
        onChange={onChange}
        options={OPTIONS}
        aria-label="Test"
      />,
    )

    fireEvent.keyDown(screen.getByRole("radio", { name: "B" }), { key: "Home" })
    expect(onChange).toHaveBeenCalledWith("a")

    fireEvent.keyDown(screen.getByRole("radio", { name: "B" }), { key: "End" })
    expect(onChange).toHaveBeenCalledWith("c")
  })
})
