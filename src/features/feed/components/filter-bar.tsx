import { ChevronLeft, ChevronRight, Eye, EyeOff, List, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { formatDayLabel } from "../utils/format-day-label"

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
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleClearSearch = () => {
    if (searchQuery) {
      onSearchChange("")
    } else {
      setSearchOpen(false)
    }
  }

  const handleMobileSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setSearchOpen(false)
    }
  }

  const handleDesktopClearSearch = () => {
    onSearchChange("")
  }

  const showClearButton = searchQuery.length > 0

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-border bg-background pb-2">
      {/* Row 1: status, toggles, search */}
      <div className="flex items-center gap-2">
        {/* Mobile: expanded search replaces other controls */}
        {searchOpen ? (
          <div className="relative flex-1 md:hidden">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={mobileSearchInputRef}
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              maxLength={200}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={handleMobileSearchKeyDown}
              className="min-h-[44px] w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label="Search articles"
            />
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={searchQuery ? "Clear search" : "Close search"}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <>
            {/* Left section: article count */}
            <div className="flex items-center gap-2 md:hidden">
              <span className="text-xs text-muted-foreground" aria-label="Article count">
                {showHidden
                  ? `${articleCount} + ${hiddenCount} hidden`
                  : `${articleCount} articles`}
              </span>
            </div>

            {/* Spacer to push toggle buttons and search icon to the right on mobile */}
            <div className="flex-1 md:hidden" />

            {/* Toggle buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={allArticles ? "secondary" : "outline"}
                size="sm"
                onClick={onToggleAllArticles}
                aria-pressed={allArticles}
                aria-label="All articles"
                className="h-8 min-h-[44px] min-w-[44px] rounded-full px-3 text-xs md:min-h-[28px] md:min-w-0"
              >
                <List className="size-3.5" />
                <span className="hidden md:inline">{"All articles"}</span>
              </Button>

              <Button
                variant={showHidden ? "secondary" : "outline"}
                size="sm"
                onClick={onToggleShowHidden}
                aria-pressed={showHidden}
                aria-label="Hidden"
                className="h-8 min-h-[44px] min-w-[44px] rounded-full px-3 text-xs md:min-h-[28px] md:min-w-0"
              >
                {showHidden ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
                <span className="hidden md:inline">{"Hidden"}</span>
              </Button>
            </div>

            {/* Mobile search icon button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className={cn(
                "min-h-[44px] min-w-[44px] rounded-full max-md:px-3 md:hidden",
                searchQuery && "bg-accent text-accent-foreground",
              )}
            >
              <Search className="size-4" />
            </Button>
          </>
        )}

        {/* Desktop: left section with article count */}
        <div className="hidden items-center gap-2 md:flex md:order-first">
          <span className="text-xs text-muted-foreground" aria-label="Article count">
            {showHidden
              ? `${articleCount} + ${hiddenCount} hidden`
              : `${articleCount} articles`}
          </span>
        </div>

        {/* Desktop search (always visible) */}
        <div className="relative hidden min-w-[120px] flex-1 md:flex">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            maxLength={200}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-[32px]"
            aria-label="Search articles"
          />
          {showClearButton && (
            <button
              type="button"
              onClick={handleDesktopClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
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
            aria-label="Previous day"
            className="min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-[28px]"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="min-w-0 text-sm font-medium text-foreground">
            {formatDayLabel(selectedDate)}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNext}
            disabled={isToday}
            aria-label="Next day"
            className="min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-[28px]"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
