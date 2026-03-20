import { describe, expect, it } from "vitest"

import { connectors } from "./registry"

describe("connector registry", () => {
  it("contains exactly 7 connectors", () => {
    expect(connectors).toHaveLength(7)
  })

  it("contains all expected connector IDs", () => {
    const ids = connectors.map((c) => c.id)
    expect(ids).toContain("digitec")
    expect(ids).toContain("galaxus")
    expect(ids).toContain("srf")
    expect(ids).toContain("winfuture")
    expect(ids).toContain("engadget")
    expect(ids).toContain("heise")
    expect(ids).toContain("ubergizmo")
  })

  it("has unique connector IDs", () => {
    const ids = connectors.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("provides an iterable array", () => {
    const names = connectors.map((c) => c.name)
    expect(names.length).toBe(7)
    for (const name of names) {
      expect(name).toBeTruthy()
    }
  })
})
