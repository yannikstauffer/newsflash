export type SyncStatus = "IDLE" | "SYNCING" | "SUCCESS" | "ERROR"

type SyncAction = "START" | "COMPLETE" | "FAIL" | "RESET"

const transitions: Record<SyncStatus, Partial<Record<SyncAction, SyncStatus>>> = {
  IDLE: { START: "SYNCING" },
  SYNCING: { COMPLETE: "SUCCESS", FAIL: "ERROR" },
  SUCCESS: { RESET: "IDLE" },
  ERROR: { RESET: "IDLE" },
}

export function transitionSyncStatus(
  current: SyncStatus,
  action: SyncAction,
): SyncStatus {
  // eslint-disable-next-line security/detect-object-injection -- action is a union type from our codebase
  const next = transitions[current][action]
  return next ?? current
}
