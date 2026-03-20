import { Eye, EyeOff, Search } from "lucide-react"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { connectors } from "@/features/connectors/registry"

interface FilterBarProps {
  readonly enabledSources: Set<string>
  readonly onToggleSource: (sourceId: string) => void
  readonly language: "all" | "de" | "en"
  readonly onLanguageChange: (language: "all" | "de" | "en") => void
  readonly showHidden: boolean
  readonly onToggleShowHidden: () => void
  readonly searchQuery: string
  readonly onSearchChange: (query: string) => void
  readonly refreshButton?: ReactNode
}

const LANGUAGES: Array<{ value: "all" | "de" | "en"; label: string }> = [
  { value: "all", label: "All" },
  { value: "de", label: "DE" },
  { value: "en", label: "EN" },
]

export function FilterBar({
  enabledSources,
  onToggleSource,
  language,
  onLanguageChange,
  showHidden,
  onToggleShowHidden,
  searchQuery,
  onSearchChange,
  refreshButton,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            variant={enabledSources.has(connector.id) ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSource(connector.id)}
            aria-pressed={enabledSources.has(connector.id)}
            className="h-8 rounded-full px-3 text-xs"
          >
            {connector.name}
          </Button>
        ))}
        {refreshButton && (
          <div className="ml-auto">{refreshButton}</div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-border" role="radiogroup" aria-label="Language filter">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              role="radio"
              aria-checked={language === value}
              className={`min-h-[44px] px-3 text-xs font-medium transition-colors duration-150 first:rounded-l-full last:rounded-r-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-[32px] ${
                language === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => onLanguageChange(value)}
            >
              {label}
            </button>
          ))}
        </div>

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

        <div className="relative min-w-[120px] flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="min-h-[44px] w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-[32px]"
            aria-label="Search articles"
          />
        </div>
      </div>
    </div>
  )
}
