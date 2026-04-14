import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SettingRow } from "./setting-row"

describe("SettingRow", () => {
  it("renders the label", () => {
    render(<SettingRow label="Enable" checked={false} onCheckedChange={() => {}} />)
    expect(screen.getByText("Enable")).toBeInTheDocument()
  })

  it("uses label as default aria-label on switch", () => {
    render(<SettingRow label="Enable" checked={false} onCheckedChange={() => {}} />)
    expect(screen.getByRole("switch", { name: "Enable" })).toBeInTheDocument()
  })

  it("honours an explicit aria-label", () => {
    render(
      <SettingRow
        label="Hide"
        checked={false}
        onCheckedChange={() => {}}
        aria-label="Hide feed"
      />,
    )
    expect(screen.getByRole("switch", { name: "Hide feed" })).toBeInTheDocument()
  })

  it("calls onCheckedChange when toggled", () => {
    const onCheckedChange = vi.fn()
    render(<SettingRow label="Enable" checked={false} onCheckedChange={onCheckedChange} />)
    fireEvent.click(screen.getByRole("switch"))
    expect(onCheckedChange).toHaveBeenCalled()
  })

  it("reflects checked state", () => {
    render(<SettingRow label="Enable" checked={true} onCheckedChange={() => {}} />)
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true")
  })
})
