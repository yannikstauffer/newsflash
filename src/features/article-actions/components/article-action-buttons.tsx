import { Bookmark, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  return (
    <div className="hidden gap-1 group-hover:flex group-focus-within:flex touch-device:md:flex touch-device:gap-0.5">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          onHide()
        }}
        aria-label={t("actions.hideArticle")}
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
        aria-label={isSaved ? t("actions.removeFromReadList") : t("actions.saveToReadList")}
        className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
      >
        <Bookmark
          className={`size-3.5 ${isSaved ? "fill-current" : ""}`}
        />
      </Button>
    </div>
  )
}
