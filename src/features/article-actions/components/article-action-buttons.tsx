import { Bookmark, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ArticleActionButtonsProps {
  readonly onHide: () => void
  readonly onSave: () => void
  readonly isSaved: boolean
}

export function ArticleActionButtons({
  onHide,
  onSave,
  isSaved,
}: ArticleActionButtonsProps) {
  return (
    <div className="hidden gap-1 group-hover:flex">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          onHide()
        }}
        aria-label="Hide article"
        className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
      >
        <EyeOff className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          onSave()
        }}
        aria-label={isSaved ? "Remove from read list" : "Save to read list"}
        className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
      >
        <Bookmark
          className={`size-3.5 ${isSaved ? "fill-current" : ""}`}
        />
      </Button>
    </div>
  )
}
