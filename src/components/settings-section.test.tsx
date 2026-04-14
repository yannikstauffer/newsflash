import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SettingsSection } from "./settings-section"

describe("SettingsSection", () => {
  it("renders title and children", () => {
    render(
      <SettingsSection title="Appearance">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <div data-testid="content">body</div>
      </SettingsSection>,
    )

    expect(screen.getByRole("heading", { name: "Appearance" })).toBeInTheDocument()
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("renders description when provided", () => {
    render(
      <SettingsSection title="Sources" description="Manage your sources">
        <div />
      </SettingsSection>,
    )

    expect(screen.getByText("Manage your sources")).toBeInTheDocument()
  })

  it("renders headerAction slot", () => {
    render(
      <SettingsSection
        title="Sources"
        headerAction={
          // eslint-disable-next-line i18next/no-literal-string
          <button type="button">Enable all</button>
        }
      >
        <div />
      </SettingsSection>,
    )

    expect(screen.getByRole("button", { name: "Enable all" })).toBeInTheDocument()
  })

  it("passes aria-label and data-testid through", () => {
    render(
      <SettingsSection title="S" aria-label="Sync" data-testid="sync-settings">
        <div />
      </SettingsSection>,
    )

    expect(screen.getByTestId("sync-settings")).toHaveAttribute("aria-label", "Sync")
  })
})
