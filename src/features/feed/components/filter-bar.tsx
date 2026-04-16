import { ChevronLeft, ChevronRight, Eye, EyeOff, List } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { formatDayLabel } from "../utils/format-day-label"

import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  readonly articleCount: number
  readonly hiddenCount: number
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
  articleCount,
  hiddenCount,
}: FilterBarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { t, i18n } = useTranslation()

  return (
    <div
      className="sticky top-0 z-10 -mx-3 -mt-3 flex flex-col gap-2 border-b border-border bg-background/95 px-3 pb-2 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:top-[calc(theme(spacing.2)*2+48px+1px)] md:-mx-6 md:-mt-6 md:px-6 md:pb-2 md:pt-6">
      {/* Row 1: status, toggles, search */}
      <div className="flex items-center gap-2">
        {/* Left section: article count */}
        <div className={cn("items-center gap-2 md:hidden", mobileSearchOpen ? "hidden" : "flex")}>
          <span className="text-xs text-muted-foreground" aria-label="Article count">
            {showHidden
              ? t("feed.articleCountWithHidden", { count: articleCount, hiddenCount })
              : t("feed.articleCount", { count: articleCount })}
          </span>
        </div>

        {/* Spacer to push toggle buttons and search icon to the right on mobile */}
        {!mobileSearchOpen && <div className="flex-1 md:hidden" />}

        {/* Toggle buttons */}
        <div className={cn("items-center gap-2 md:flex", mobileSearchOpen ? "hidden" : "flex")}>
          <Button
            variant={allArticles ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleAllArticles}
            aria-pressed={allArticles}
            aria-label={t("feed.allArticles")}
            className="rounded-full"
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
            className="rounded-full"
          >
            {showHidden ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
            <span className="hidden md:inline">{t("feed.hidden")}</span>
          </Button>
        </div>

        {/* Desktop: left section with article count */}
        <div className="hidden items-center gap-2 md:flex md:order-first">
          <span className="text-xs text-muted-foreground" aria-label="Article count">
            {showHidden
              ? t("feed.articleCountWithHidden", { count: articleCount, hiddenCount })
              : t("feed.articleCount", { count: articleCount })}
          </span>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t("feed.searchPlaceholder")}
          aria-label={t("feed.searchLabel")}
          onMobileOpenChange={setMobileSearchOpen}
        />
      </div>

      {/* Row 2: day navigation (centered) */}
      {!allArticles && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onPrev}
            aria-label="Previous day"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="w-52 shrink-0 text-center text-sm font-medium text-foreground">
            {formatDayLabel(selectedDate, undefined, i18n.language)}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNext}
            disabled={isToday}
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
