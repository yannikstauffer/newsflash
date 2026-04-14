import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly maxLength?: number
  readonly "aria-label": string
  readonly className?: string
  readonly onMobileOpenChange?: (open: boolean) => void
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  maxLength = 200,
  "aria-label": ariaLabel,
  className,
  onMobileOpenChange,
}: SearchInputProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mobileOpen && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [mobileOpen])

  function setMobileOpenAndNotify(open: boolean) {
    setMobileOpen(open)
    onMobileOpenChange?.(open)
  }

  function handleMobileClear() {
    if (value) {
      onChange("")
    } else {
      setMobileOpenAndNotify(false)
    }
  }

  function handleMobileKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setMobileOpenAndNotify(false)
    }
  }

  const hasValue = value.length > 0

  return (
    <>
      {mobileOpen ? (
        <div className={cn("relative flex-1 md:hidden", className)}>
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={mobileInputRef}
            type="search"
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleMobileKeyDown}
            className="min-h-[44px] w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={ariaLabel}
          />
          <button
            type="button"
            onClick={handleMobileClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={hasValue ? "Clear search" : "Close search"}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpenAndNotify(true)}
          aria-label="Open search"
          className={cn(
            "rounded-full max-md:px-3 md:hidden",
            hasValue && "bg-accent text-accent-foreground",
          )}
        >
          <Search className="size-4" />
        </Button>
      )}

      <div className={cn("relative hidden min-w-[120px] flex-1 md:flex", className)}>
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-[32px]"
          aria-label={ariaLabel}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </>
  )
}
