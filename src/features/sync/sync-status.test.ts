import { describe, expect, it } from "vitest"

import { transitionSyncStatus } from "./sync-status"

import type { SyncStatus } from "./sync-status"

describe("transitionSyncStatus", () => {
  it("transitions IDLE to SYNCING on START", () => {
    expect(transitionSyncStatus("IDLE", "START")).toBe("SYNCING")
  })

  it("transitions SYNCING to SUCCESS on COMPLETE", () => {
    expect(transitionSyncStatus("SYNCING", "COMPLETE")).toBe("SUCCESS")
  })

  it("transitions SYNCING to ERROR on FAIL", () => {
    expect(transitionSyncStatus("SYNCING", "FAIL")).toBe("ERROR")
  })

  it("transitions SUCCESS to IDLE on RESET", () => {
    expect(transitionSyncStatus("SUCCESS", "RESET")).toBe("IDLE")
  })

  it("transitions ERROR to IDLE on RESET", () => {
    expect(transitionSyncStatus("ERROR", "RESET")).toBe("IDLE")
  })

  it("ignores invalid transitions and returns current state", () => {
    const invalidCases: Array<[SyncStatus, "START" | "COMPLETE" | "FAIL" | "RESET"]> = [
      ["IDLE", "COMPLETE"],
      ["IDLE", "FAIL"],
      ["IDLE", "RESET"],
      ["SYNCING", "START"],
      ["SYNCING", "RESET"],
      ["SUCCESS", "START"],
      ["SUCCESS", "COMPLETE"],
      ["ERROR", "START"],
      ["ERROR", "FAIL"],
    ]

    for (const [state, action] of invalidCases) {
      expect(transitionSyncStatus(state, action)).toBe(state)
    }
  })
})
