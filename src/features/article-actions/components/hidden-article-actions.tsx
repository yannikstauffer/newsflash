import { Eye } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

interface HiddenArticleActionsProps {
  readonly onUnhide: () => void
}

export function HiddenArticleActions({ onUnhide }: HiddenArticleActionsProps) {
  const { t } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
        onUnhide()
      }}
      aria-label={t("actions.unhideArticle")}
    >
      <Eye className="size-3.5" />
    </Button>
  )
}
