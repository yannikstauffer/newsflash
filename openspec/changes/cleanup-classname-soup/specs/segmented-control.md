# Spec: `<SegmentedControl>`

## Location

`src/components/segmented-control.tsx`

## Props

```tsx
interface SegmentedControlProps<T extends string> {
  readonly value: T
  readonly onChange: (value: T) => void
  readonly options: ReadonlyArray<{ readonly value: T; readonly label: string }>
  readonly "aria-label": string
}
```

## Markup

```tsx
<div
  className="inline-flex rounded-lg border border-border"
  role="radiogroup"
  aria-label={ariaLabel}
>
  {options.map((option, index) => (
    <button
      key={option.value}
      type="button"
      role="radio"
      aria-checked={value === option.value}
      tabIndex={value === option.value ? 0 : -1}
      onClick={() => onChange(option.value)}
      onKeyDown={(event) => handleKeyDown(event, index)}
      className={cn(
        "min-h-[44px] px-4 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg md:min-h-0 md:py-2",
        value === option.value
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {option.label}
    </button>
  ))}
</div>
```

## Keyboard navigation

Implemented via `handleKeyDown`:

| Key | Action |
|---|---|
| ArrowRight / ArrowDown | Select next option (wrap to first) |
| ArrowLeft / ArrowUp | Select previous option (wrap to last) |
| Home | Select first option |
| End | Select last option |

On arrow key press:
1. Call `onChange` with the new value
2. Focus the new button (via ref array or `event.currentTarget.parentElement.children`)

This follows the [WAI-ARIA Radio Group pattern](https://www.w3.org/WAI/ARIA/apd/patterns/radio/).

## Replaces

2 copy-pasted blocks in `feed-config-page.tsx`:
- Theme picker (lines 170-191)
- Locale picker (lines 142-162)

## Test requirements

- Renders all options
- Shows selected state (aria-checked)
- Calls onChange on click
- Arrow keys cycle through options (wrapping)
- Home/End select first/last
- Only selected option has tabIndex 0
