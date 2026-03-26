import { describe, expect, it } from "vitest"

import { formatAbsoluteTime, formatRelativeTime, formatShortTime } from "./format-time"

describe("formatAbsoluteTime", () => {
  it("returns locale-formatted date for English", () => {
    const date = new Date(2026, 2, 20, 14, 32, 5)
    const result = formatAbsoluteTime(date, "en")
    // Intl output varies by environment, but should contain key parts
    expect(result).toContain("20")
    expect(result).toContain("2026")
  })

  it("returns locale-formatted date for German", () => {
    const date = new Date(2026, 2, 20, 14, 32, 5)
    const result = formatAbsoluteTime(date, "de")
    expect(result).toContain("20")
    expect(result).toContain("2026")
  })

  it("defaults to English locale", () => {
    const date = new Date(2026, 2, 20, 14, 32, 5)
    const resultDefault = formatAbsoluteTime(date)
    const resultEn = formatAbsoluteTime(date, "en")
    expect(resultDefault).toBe(resultEn)
  })
})

describe("formatShortTime", () => {
  it("returns short format for English", () => {
    const date = new Date(2026, 2, 20, 14, 32)
    const result = formatShortTime(date, "en")
    expect(result).toContain("20")
  })

  it("returns short format for German", () => {
    const date = new Date(2026, 2, 20, 14, 32)
    const result = formatShortTime(date, "de")
    expect(result).toContain("20")
  })

  it("defaults to English locale", () => {
    const date = new Date(2026, 2, 20, 14, 32)
    const resultDefault = formatShortTime(date)
    const resultEn = formatShortTime(date, "en")
    expect(resultDefault).toBe(resultEn)
  })
})

describe("formatRelativeTime", () => {
  const base = new Date("2026-03-20T12:00:00Z")

  describe("English locale", () => {
    it.each([
      {
        name: "just now for less than 60 seconds",
        date: new Date("2026-03-20T11:59:30Z"),
        expected: "just now",
      },
      {
        name: "1 minute ago",
        date: new Date("2026-03-20T11:59:00Z"),
        expected: "1 minute ago",
      },
      {
        name: "multiple minutes ago",
        date: new Date("2026-03-20T11:45:00Z"),
        expected: "15 minutes ago",
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
    ])("returns '$expected' for $name", ({ date, expected }) => {
      expect(formatRelativeTime(date, base, "en")).toBe(expected)
    })
  })

  describe("German locale", () => {
    it.each([
      {
        name: "just now",
        date: new Date("2026-03-20T11:59:30Z"),
        expected: "just now",
      },
      {
        name: "1 minute ago",
        date: new Date("2026-03-20T11:59:00Z"),
        expected: "vor 1 Minute",
      },
      {
        name: "multiple minutes ago",
        date: new Date("2026-03-20T11:45:00Z"),
        expected: "vor 15 Minuten",
      },
      {
        name: "1 hour ago",
        date: new Date("2026-03-20T11:00:00Z"),
        expected: "vor 1 Stunde",
      },
      {
        name: "multiple hours ago",
        date: new Date("2026-03-20T09:00:00Z"),
        expected: "vor 3 Stunden",
      },
    ])("returns '$expected' for $name", ({ date, expected }) => {
      expect(formatRelativeTime(date, base, "de")).toBe(expected)
    })
  })

  it("defaults to English locale", () => {
    const date = new Date("2026-03-20T11:59:00Z")
    const resultDefault = formatRelativeTime(date, base)
    const resultEn = formatRelativeTime(date, base, "en")
    expect(resultDefault).toBe(resultEn)
  })
})
