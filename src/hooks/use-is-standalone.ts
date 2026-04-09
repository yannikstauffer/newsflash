import { useSyncExternalStore } from "react"

function getSnapshot(): boolean {
  if (
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(display-mode: standalone)").matches
  ) {
    return true
  }
  if ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone) {
    return true
  }
  return false
}

function subscribe(callback: () => void): () => void {
  if (typeof globalThis.matchMedia !== "function") {
    return () => {}
  }
  const mediaQuery = globalThis.matchMedia("(display-mode: standalone)")
  mediaQuery.addEventListener("change", callback)
  return () => {
    mediaQuery.removeEventListener("change", callback)
  }
}

function getServerSnapshot(): boolean {
  return false
}

export function useIsStandalone(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
