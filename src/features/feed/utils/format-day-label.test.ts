import { describe, expect, it } from "vitest"

import { formatDayLabel } from "./format-day-label"

describe("formatDayLabel", () => {
  const now = new Date(2026, 2, 20) // Friday, March 20, 2026

  describe("English locale", () => {
    it("returns 'today' label for same day", () => {
      const result = formatDayLabel(new Date(2026, 2, 20), now, "en")
      expect(result).toContain("today")
      expect(result).toContain("2026")
    })

    it("returns 'yesterday' label for the previous day", () => {
      const result = formatDayLabel(new Date(2026, 2, 19), now, "en")
      expect(result).toContain("yesterday")
      expect(result).toContain("2026")
    })

    it("returns weekday name for older days", () => {
      const result = formatDayLabel(new Date(2026, 2, 18), now, "en")
      expect(result).toContain("Wednesday")
    })

    it("defaults to English locale", () => {
      const resultDefault = formatDayLabel(new Date(2026, 2, 20), now)
      const resultEn = formatDayLabel(new Date(2026, 2, 20), now, "en")
      expect(resultDefault).toBe(resultEn)
    })
  })

  describe("German locale", () => {
    it("returns 'heute' label for same day", () => {
      const result = formatDayLabel(new Date(2026, 2, 20), now, "de")
      expect(result).toContain("heute")
      expect(result).toContain("2026")
    })

    it("returns 'gestern' label for the previous day", () => {
      const result = formatDayLabel(new Date(2026, 2, 19), now, "de")
      expect(result).toContain("gestern")
      expect(result).toContain("2026")
    })

    it("returns German weekday name for older days", () => {
      const result = formatDayLabel(new Date(2026, 2, 18), now, "de")
      expect(result).toContain("Mittwoch")
    })
  })

  it("uses current time as default when now is not provided", () => {
    const today = new Date()
    const label = formatDayLabel(today)
    expect(label).toContain("today")
  })
})
