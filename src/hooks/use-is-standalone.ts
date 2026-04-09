import { useSyncExternalStore } from "react"

function getSnapshot(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true
  }
  if ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone) {
    return true
  }
  return false
}

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(display-mode: standalone)")
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
