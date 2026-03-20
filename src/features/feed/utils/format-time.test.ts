import { describe, expect, it } from "vitest"

import { formatAbsoluteTime, formatShortTime } from "./format-time"

describe("formatAbsoluteTime", () => {
  it.each([
    {
      name: "standard date",
      date: new Date(2026, 2, 20, 14, 32, 5),
      expected: "20.03.2026 14:32:05",
    },
    {
      name: "zero-padded values",
      date: new Date(2026, 0, 5, 3, 7, 9),
      expected: "05.01.2026 03:07:09",
    },
    {
      name: "midnight",
      date: new Date(2026, 11, 31, 0, 0, 0),
      expected: "31.12.2026 00:00:00",
    },
    {
      name: "end of day",
      date: new Date(2026, 0, 1, 23, 59, 59),
      expected: "01.01.2026 23:59:59",
    },
  ])("returns correct format for $name", ({ date, expected }) => {
    expect(formatAbsoluteTime(date)).toBe(expected)
  })
})

describe("formatShortTime", () => {
  it.each([
    {
      name: "standard date",
      date: new Date(2026, 2, 20, 14, 32, 5),
      expected: "20.03. 14:32",
    },
    {
      name: "zero-padded values",
      date: new Date(2026, 0, 5, 3, 7, 9),
      expected: "05.01. 03:07",
    },
    {
      name: "midnight",
      date: new Date(2026, 11, 31, 0, 0, 0),
      expected: "31.12. 00:00",
    },
    {
      name: "end of day",
      date: new Date(2026, 0, 1, 23, 59, 0),
      expected: "01.01. 23:59",
    },
  ])("returns correct format for $name", ({ date, expected }) => {
    expect(formatShortTime(date)).toBe(expected)
  })
})
