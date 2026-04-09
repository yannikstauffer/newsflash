import { useCallback, useEffect, useRef, useState } from "react"

import { useIsStandalone } from "./use-is-standalone"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[]
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>
}

const STORAGE_KEY = "newsflash:install-dismissed"
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

function isDismissedRecently(): boolean {
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const timestamp = Number(raw)
    if (Number.isNaN(timestamp)) return false
    return Date.now() - timestamp < COOLDOWN_MS
  } catch {
    return false
  }
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent
  const isIos = /iPhone|iPad|iPod/.test(ua)
  const isNonSafariBrowser = /CriOS|FxiOS/.test(ua)
  return isIos && !isNonSafariBrowser
}

interface InstallPromptResult {
  readonly canInstall: boolean
  readonly isIosSafari: boolean
  readonly isDismissed: boolean
  readonly triggerInstall: () => Promise<void>
  readonly dismiss: () => void
}

export function useInstallPrompt(): InstallPromptResult {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [dismissed, setDismissed] = useState(() => isDismissedRecently())
  const isStandalone = useIsStandalone()

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      deferredPrompt.current = event as BeforeInstallPromptEvent
      setCanInstall(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const triggerInstall = useCallback(async () => {
    const prompt = deferredPrompt.current
    if (!prompt) return
    const result = await prompt.prompt()
    if (result.outcome === "accepted") {
      deferredPrompt.current = null
      setCanInstall(false)
    }
  }, [])

  const dismiss = useCallback(() => {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // localStorage unavailable or full
    }
    setDismissed(true)
  }, [])

  return {
    canInstall: isStandalone ? false : canInstall,
    isIosSafari: isStandalone ? false : isIosSafari(),
    isDismissed: dismissed,
    triggerInstall,
    dismiss,
  }
}
