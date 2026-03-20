import { describe, expect, it } from "vitest"

import { formatAbsoluteTime, formatRelativeTime, formatShortTime } from "./format-time"

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

describe("formatRelativeTime", () => {
  const base = new Date("2026-03-20T12:00:00Z")

  it.each([
    {
      name: "just now for less than 60 seconds",
      date: new Date("2026-03-20T11:59:30Z"),
      expected: "just now",
    },
    {
      name: "1 min ago",
      date: new Date("2026-03-20T11:59:00Z"),
      expected: "1 min ago",
    },
    {
      name: "multiple minutes ago",
      date: new Date("2026-03-20T11:45:00Z"),
      expected: "15 min ago",
    },
    {
      name: "1 hour ago",
      date: new Date("2026-03-20T11:00:00Z"),
      expected: "1 hour ago",
    },
    {
      name: "multiple hours ago",
      date: new Date("2026-03-20T09:00:00Z"),
      expected: "3 hours ago",
    },
  ])("returns $expected for $name", ({ date, expected }) => {
    expect(formatRelativeTime(date, base)).toBe(expected)
  })
})
