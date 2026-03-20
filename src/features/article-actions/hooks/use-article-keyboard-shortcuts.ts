import { useEffect } from "react"

interface KeyboardShortcutOptions {
  onHide: (articleId: string) => void
  onSave: (articleId: string) => void
  getHoveredArticleId: () => string | undefined
}

export function useArticleKeyboardShortcuts({
  onHide,
  onSave,
  getHoveredArticleId,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const articleId = getHoveredArticleId()
      if (!articleId) {
        return
      }

      if (event.key === "h" || event.key === "H") {
        event.preventDefault()
        onHide(articleId)
      }

      if (event.key === "s" || event.key === "S") {
        event.preventDefault()
        onSave(articleId)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onHide, onSave, getHoveredArticleId])
}
