import { BookmarkMinus, XCircle } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { SwipeableCard } from "./swipeable-card"
import { useArticleState } from "../hooks/use-article-state"

import type { SwipeableCardHandle } from "./swipeable-card"
import type { NormalizedArticle } from "@/features/connectors/types"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ArticleCard } from "@/features/feed/components/article-card"
import { useLazyList } from "@/hooks/use-lazy-list"

export default function ReadListPage() {
  const { t } = useTranslation()
  const { readListArticles, removeFromReadList, clearReadList, restoreReadList } = useArticleState()
  const { visibleItems, sentinelRef } = useLazyList(readListArticles)
  const cardReferencesMap = useRef<Map<string, SwipeableCardHandle>>(new Map())
  const [removeAllOpen, setRemoveAllOpen] = useState(false)

  const handleRemoveAll = useCallback(() => {
    const snapshot = [...readListArticles]
    clearReadList()
    setRemoveAllOpen(false)
    toast(t("readList.removeAllToast", { count: snapshot.length }), {
      duration: 5000,
      action: {
        label: t("readList.undo"),
        onClick: () => {
          restoreReadList(snapshot)
        },
      },
    })
  }, [readListArticles, clearReadList, restoreReadList, t])

  if (readListArticles.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {t("readList.empty")}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <AlertDialog open={removeAllOpen} onOpenChange={setRemoveAllOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-8 min-h-[44px] rounded-full px-3 text-xs md:min-h-[28px]"
              />
            }
          >
            {t("readList.removeAll")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("readList.removeAllTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("readList.removeAllDescription", { count: readListArticles.length })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("readList.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveAll}>{t("readList.removeAll")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {visibleItems.map((article: NormalizedArticle) => (
        <SwipeableCard
          key={article.id}
          ref={(handle: SwipeableCardHandle | null) => {
            if (handle) {
              cardReferencesMap.current.set(article.id, handle)
            } else {
              cardReferencesMap.current.delete(article.id)
            }
          }}
          swipeRight={{
            bgClassName: "bg-red-100 dark:bg-red-900/30",
            icon: (
              <span className="text-red-700 dark:text-red-400" aria-hidden="true">
                <XCircle className="size-5" />
              </span>
            ),
            onAction: () => removeFromReadList(article.id),
          }}
        >
          <ArticleCard
            article={article}
            actions={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(event) => {
                  event.stopPropagation()
                  event.preventDefault()
                  const cardHandle = cardReferencesMap.current.get(article.id)
                  if (cardHandle) {
                    cardHandle.triggerRemoval()
                  } else {
                    removeFromReadList(article.id)
                  }
                }}
                aria-label={t("actions.removeFromReadList")}
                className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
              >
                <BookmarkMinus className="size-3.5" />
              </Button>
            }
          />
        </SwipeableCard>
      ))}

      <div ref={sentinelRef} />
    </div>
  )
}
