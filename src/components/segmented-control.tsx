import { useRef } from "react"

import type { KeyboardEvent } from "react"

import { cn } from "@/lib/utils"

interface SegmentedControlOption<T extends string> {
  readonly value: T
  readonly label: string
}

interface SegmentedControlProps<T extends string> {
  readonly value: T
  readonly onChange: (value: T) => void
  readonly options: ReadonlyArray<SegmentedControlOption<T>>
  readonly "aria-label": string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const buttonReferences = useRef<Map<T, HTMLButtonElement>>(new Map())

  function focusOption(nextValue: T) {
    const button = buttonReferences.current.get(nextValue)
    if (button) {
      button.focus()
    }
    onChange(nextValue)
  }

  function handleKeyDown(event: KeyboardEvent) {
    const currentIndex = options.findIndex((option) => option.value === value)
    if (currentIndex < 0) return

    const optionsLength = options.length
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % optionsLength
        focusOption(options.at(nextIndex)!.value)
        break
      }
      case "ArrowLeft":
      case "ArrowUp": {
        event.preventDefault()
        const nextIndex = (currentIndex - 1 + optionsLength) % optionsLength
        focusOption(options.at(nextIndex)!.value)
        break
      }
      case "Home": {
        event.preventDefault()
        focusOption(options[0]!.value)
        break
      }
      case "End": {
        event.preventDefault()
        focusOption(options.at(-1)!.value)
        break
      }
      default: {
        break
      }
    }
  }

  return (
    <div
      className="inline-flex rounded-lg border border-border"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            ref={(element) => {
              if (element) {
                buttonReferences.current.set(option.value, element)
              } else {
                buttonReferences.current.delete(option.value)
              }
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[44px] px-4 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg md:min-h-0 md:py-2",
              selected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
