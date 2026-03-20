import { describe, it, expect } from "vitest"

import { cn } from "../utils"

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("px-2", "py-1")
      expect(result).toBe("px-2 py-1")
    })

    it("should resolve Tailwind conflicts by keeping the last class", () => {
      const result = cn("px-2", "px-4")
      expect(result).toBe("px-4")
    })

    it.each([false, undefined, null, 0, ""])(
      "should ignore falsy value: %s",
      (falsy) => {
        const result = cn("base", falsy && "hidden", "visible")
        expect(result).toBe("base visible")
      },
    )

    it("should return empty string for no arguments", () => {
      const result = cn()
      expect(result).toBe("")
    })
  })
})
