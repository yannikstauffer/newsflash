import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AppLayout } from "./app-layout"

describe("AppLayout", () => {
  it("renders a skip-to-content link targeting #main-content", () => {
    render(<AppLayout />)

    const skipLink = screen.getByText("Skip to content")

    expect(skipLink.tagName).toBe("A")
    expect(skipLink.getAttribute("href")).toBe("#main-content")
  })

  it("renders a main element with id main-content", () => {
    render(<AppLayout />)

    const mainElement = document.querySelector("#main-content")

    expect(mainElement).toBeDefined()
    expect(mainElement?.tagName).toBe("MAIN")
  })

  it("places skip link before the header in DOM order", () => {
    render(<AppLayout />)

    const skipLink = screen.getByText("Skip to content")
    const header = document.querySelector("header")

    expect(
      skipLink.compareDocumentPosition(header!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
