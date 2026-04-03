import { describe, expect, it } from "vitest"

import { feedSearchSchema } from "./router"

describe("feedSearchSchema", () => {
  describe("valid inputs", () => {
    it("parses valid date", () => {
      const result = feedSearchSchema.parse({ date: "2026-04-03" })
      expect(result.date).toBe("2026-04-03")
    })

    it("parses view=all", () => {
      const result = feedSearchSchema.parse({ view: "all" })
      expect(result.view).toBe("all")
    })

    it("parses valid search query", () => {
      const result = feedSearchSchema.parse({ q: "bitcoin" })
      expect(result.q).toBe("bitcoin")
    })

    it("parses hidden=true", () => {
      const result = feedSearchSchema.parse({ hidden: true })
      expect(result.hidden).toBe(true)
    })

    it("parses all params combined", () => {
      const result = feedSearchSchema.parse({
        date: "2026-04-02",
        view: "all",
        q: "react",
        hidden: true,
      })
      expect(result).toEqual({
        date: "2026-04-02",
        view: "all",
        q: "react",
        hidden: true,
      })
    })

    it("parses empty object to all undefined", () => {
      const result = feedSearchSchema.parse({})
      expect(result).toEqual({
        date: undefined,
        view: undefined,
        q: undefined,
        hidden: undefined,
      })
    })
  })

  describe("invalid inputs fall back to undefined", () => {
    it("falls back on malformed date", () => {
      const result = feedSearchSchema.parse({ date: "not-a-date" })
      expect(result.date).toBeUndefined()
    })

    it("falls back on empty string date", () => {
      const result = feedSearchSchema.parse({ date: "" })
      expect(result.date).toBeUndefined()
    })

    it("falls back on invalid view value", () => {
      const result = feedSearchSchema.parse({ view: "invalid" })
      expect(result.view).toBeUndefined()
    })

    it("falls back on numeric view", () => {
      const result = feedSearchSchema.parse({ view: 42 })
      expect(result.view).toBeUndefined()
    })

    it("falls back on query exceeding 200 characters", () => {
      const longQuery = "a".repeat(201)
      const result = feedSearchSchema.parse({ q: longQuery })
      expect(result.q).toBeUndefined()
    })

    it("accepts query at exactly 200 characters", () => {
      const maxQuery = "a".repeat(200)
      const result = feedSearchSchema.parse({ q: maxQuery })
      expect(result.q).toBe(maxQuery)
    })

    it("falls back on non-boolean hidden", () => {
      const result = feedSearchSchema.parse({ hidden: "banana" })
      expect(result.hidden).toBeUndefined()
    })

    it("falls back on numeric hidden", () => {
      const result = feedSearchSchema.parse({ hidden: 1 })
      expect(result.hidden).toBeUndefined()
    })
  })

  describe("edge cases", () => {
    it("handles null values by falling back", () => {
      const result = feedSearchSchema.parse({
        date: null,
        view: null,
        q: null,
        hidden: null,
      })
      expect(result.date).toBeUndefined()
      expect(result.view).toBeUndefined()
      expect(result.q).toBeUndefined()
      expect(result.hidden).toBeUndefined()
    })

    it("ignores unknown properties", () => {
      const result = feedSearchSchema.parse({ unknown: "value", date: "2026-04-03" })
      expect(result.date).toBe("2026-04-03")
      expect((result as Record<string, unknown>)["unknown"]).toBeUndefined()
    })

    it("falls back on date with time component", () => {
      const result = feedSearchSchema.parse({ date: "2026-04-03T12:00:00" })
      expect(result.date).toBeUndefined()
    })

    it("parses hidden=false", () => {
      const result = feedSearchSchema.parse({ hidden: false })
      expect(result.hidden).toBe(false)
    })

    it("accepts empty string for q", () => {
      const result = feedSearchSchema.parse({ q: "" })
      expect(result.q).toBe("")
    })
  })
})
