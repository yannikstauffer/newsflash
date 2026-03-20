import { ChevronLeft, ChevronRight, Eye, EyeOff, Search } from "lucide-react"

import { formatDayLabel } from "../utils/format-day-label"
import { formatRelativeTime } from "../utils/format-time"

import { Button } from "@/components/ui/button"

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
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Left section: toggles */}
      <div className="flex items-center gap-2">
        <Button
          variant={allArticles ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleAllArticles}
          aria-pressed={allArticles}
          className="h-8 min-h-[44px] rounded-full px-3 text-xs md:min-h-[28px]"
        >
          {"All articles"}
        </Button>

        <Button
          variant={showHidden ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleShowHidden}
          aria-pressed={showHidden}
          className="h-8 min-h-[44px] rounded-full px-3 text-xs md:min-h-[28px]"
        >
          {showHidden ? (
            <Eye className="size-3.5" data-icon="inline-start" />
          ) : (
            <EyeOff className="size-3.5" data-icon="inline-start" />
          )}
          {"Hidden"}
        </Button>
      </div>

      {/* Center section: day navigation */}
      {!allArticles && (
        <div className="flex flex-1 items-center justify-center gap-1">
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

      {/* Right section: search */}
      <div className="relative min-w-[120px] flex-1">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search articles..."
          value={searchQuery}
          maxLength={200}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-h-[44px] w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-[32px]"
          aria-label="Search articles"
        />
      </div>

      {lastRefreshedAt && (
        <span className="text-xs text-muted-foreground" aria-label="Last refreshed">
          {`Refreshed ${formatRelativeTime(lastRefreshedAt)}`}
        </span>
      )}
    </div>
  )
}
