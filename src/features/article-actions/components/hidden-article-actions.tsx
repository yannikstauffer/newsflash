import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

interface HiddenArticleActionsProps {
  readonly onUnhide: () => void
}

export function HiddenArticleActions({ onUnhide }: HiddenArticleActionsProps) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
        onUnhide()
      }}
      aria-label="Unhide article"
      className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
    >
      <Eye className="size-3.5" />
    </Button>
  )
}
