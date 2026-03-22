import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  List,
  Search,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { formatDayLabel } from "../utils/format-day-label"
import { formatRelativeTime } from "../utils/format-time"

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
import { useArticleState } from "@/features/article-actions"

interface FilterBarProps {
  readonly showHidden: boolean
  readonly onToggleShowHidden: () => void
  readonly searchQuery: string
  readonly onSearchChange: (query: string) => void
  readonly selectedDate: Date
  readonly allArticles: boolean
  readonly isToday: boolean
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly onToggleAllArticles: () => void
  readonly lastRefreshedAt: Date | null
  readonly articleCount: number
  readonly hiddenCount: number
  readonly onHideAll: () => void
  readonly visibleArticleIds: string[]
}

export function FilterBar({
  showHidden,
  onToggleShowHidden,
  searchQuery,
  onSearchChange,
  selectedDate,
  allArticles,
  isToday,
  onPrev,
  onNext,
  onToggleAllArticles,
  lastRefreshedAt,
  articleCount,
  hiddenCount,
  onHideAll,
  visibleArticleIds,
}: FilterBarProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [hideAllOpen, setHideAllOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const { unhideArticles } = useArticleState()

  useEffect(() => {
    if (searchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [searchOpen])

  function handleClearOrCollapse() {
    if (searchQuery) {
      onSearchChange("")
    } else {
      setSearchOpen(false)
    }
  }

  function handleMobileSearchKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setSearchOpen(false)
    }
  }

  function handleDesktopClear() {
    onSearchChange("")
  }

  const handleConfirmHideAll = useCallback(() => {
    const snapshot = [...visibleArticleIds]
    onHideAll()
    setHideAllOpen(false)
    toast(t("feed.hideAllToast", { count: snapshot.length }), {
      duration: 5000,
      action: {
        label: t("feed.undo"),
        onClick: () => {
          unhideArticles(snapshot)
        },
      },
    })
  }, [visibleArticleIds, onHideAll, unhideArticles, t])

  const showClearDesktop = searchQuery || searchFocused
  const dayLabel = allArticles ? t("feed.allDays") : formatDayLabel(selectedDate, undefined, locale)

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: status, toggles, search */}
      <div className="flex items-center gap-2">
        {/* Mobile: when search is open, show full-width search input */}
        {searchOpen ? (
          <div className="relative flex flex-1 md:hidden">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={mobileSearchInputRef}
              type="search"
              placeholder={t("feed.searchPlaceholder")}
              value={searchQuery}
              maxLength={200}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={handleMobileSearchKeyDown}
              className="min-h-[44px] w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={t("feed.searchLabel")}
            />
            <button
              type="button"
              onClick={handleClearOrCollapse}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("feed.clearSearch")}
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Left: refresh status + article count */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {lastRefreshedAt && (
                <span aria-label={t("feed.refreshed", { time: "" }).trim()}>
                  {t("feed.refreshed", { time: formatRelativeTime(lastRefreshedAt, new Date(), locale) })}
                </span>
              )}
              <span aria-label={t("feed.articleCount", { count: articleCount })}>
                {showHidden && hiddenCount > 0
                  ? t("feed.articleCountWithHidden", { count: articleCount, hiddenCount })
                  : t("feed.articleCount", { count: articleCount })}
              </span>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-2">
              <Button
                variant={allArticles ? "secondary" : "outline"}
                size="sm"
                onClick={onToggleAllArticles}
                aria-pressed={allArticles}
                aria-label={t("feed.allArticles")}
                className="h-8 min-h-[44px] rounded-full px-3 text-xs md:min-h-[28px]"
              >
                <List className="size-3.5" />
                <span className="hidden md:inline">{t("feed.allArticles")}</span>
              </Button>

              <Button
                variant={showHidden ? "secondary" : "outline"}
                size="sm"
                onClick={onToggleShowHidden}
                aria-pressed={showHidden}
                aria-label={t("feed.hidden")}
                className="h-8 min-h-[44px] rounded-full px-3 text-xs md:min-h-[28px]"
              >
                {showHidden ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
                <span className="hidden md:inline">{t("feed.hidden")}</span>
              </Button>

              <AlertDialog open={hideAllOpen} onOpenChange={setHideAllOpen}>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 min-h-[44px] rounded-full px-3 text-xs md:min-h-[28px]"
                      disabled={visibleArticleIds.length === 0}
                    />
                  }
                >
                  {t("feed.hideAll")}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("feed.hideAllTitle", { dayLabel })}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("feed.hideAllDescription", { count: visibleArticleIds.length })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("feed.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmHideAll}>{t("feed.hideAll")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Mobile search icon button */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setSearchOpen(true)}
              aria-label={t("feed.openSearch")}
              className={`min-h-[44px] min-w-[44px] rounded-full md:hidden ${
                searchQuery ? "border-primary text-primary" : ""
              }`}
            >
              <Search className="size-3.5" />
            </Button>
          </>
        )}

        {/* Desktop search: always visible */}
        <div className="relative hidden min-w-[120px] flex-1 md:flex">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder={t("feed.searchPlaceholder")}
            value={searchQuery}
            maxLength={200}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="min-h-[32px] w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={t("feed.searchLabel")}
          />
          {showClearDesktop && (
            <button
              type="button"
              onClick={handleDesktopClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("feed.clearSearch")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: day navigation (centered) */}
      {!allArticles && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onPrev}
            aria-label={t("feed.previousDay")}
            className="min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-[28px]"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="min-w-0 text-sm font-medium text-foreground">
            {formatDayLabel(selectedDate, undefined, locale)}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNext}
            disabled={isToday}
            aria-label={t("feed.nextDay")}
            className="min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-[28px]"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
