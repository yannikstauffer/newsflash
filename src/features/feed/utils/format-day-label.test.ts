import { describe, expect, it } from "vitest"

import { formatDayLabel } from "./format-day-label"

describe("formatDayLabel", () => {
  const now = new Date(2026, 2, 20) // Friday, March 20, 2026

  it("returns 'today' label for same day", () => {
    expect(formatDayLabel(new Date(2026, 2, 20), now)).toBe(
      "today, 20.03.2026",
    )
  })

  it("returns 'yesterday' label for the previous day", () => {
    expect(formatDayLabel(new Date(2026, 2, 19), now)).toBe(
      "yesterday, 19.03.2026",
    )
  })

  it("returns weekday name for older days", () => {
    // Wednesday, March 18, 2026
    expect(formatDayLabel(new Date(2026, 2, 18), now)).toBe(
      "wednesday, 18.03.2026",
    )
  })

  it.each([
    { date: new Date(2026, 2, 15), expected: "sunday, 15.03.2026" },
    { date: new Date(2026, 2, 16), expected: "monday, 16.03.2026" },
    { date: new Date(2026, 2, 17), expected: "tuesday, 17.03.2026" },
    { date: new Date(2026, 2, 18), expected: "wednesday, 18.03.2026" },
  ])("returns correct weekday for $expected", ({ date, expected }) => {
    expect(formatDayLabel(date, now)).toBe(expected)
  })

  it("zero-pads single-digit day and month", () => {
    const jan = new Date(2026, 0, 5)
    const ref = new Date(2026, 0, 7)
    expect(formatDayLabel(jan, ref)).toBe("monday, 05.01.2026")
  })

  it("uses current time as default when now is not provided", () => {
    const today = new Date()
    const label = formatDayLabel(today)
    expect(label).toContain("today, ")
  })
})
