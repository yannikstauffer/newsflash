# Spec: `<SearchInput>`

## Location

`src/components/search-input.tsx`

## Props

```tsx
interface SearchInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly maxLength?: number
  readonly "aria-label": string
  readonly onMobileOpenChange?: (open: boolean) => void
}
```

## Behaviour

### Desktop (md+)

Always visible. Standard input with:
- Search icon (left)
- Clear button (right, only when value is non-empty)
- Rounded-full border styling matching current filter-bar inputs

### Mobile (<md)

Two states:

**Collapsed (default):**
- Shows a search icon button
- If `value` is non-empty, button has active indicator (`bg-accent text-accent-foreground`)

**Expanded:**
- Full-width input replaces the button
- Auto-focuses the input
- Clear button (right): clears value if non-empty, collapses if empty
- Escape key: collapses (value is preserved)

### Internal state

```tsx
const [mobileOpen, setMobileOpen] = useState(false)
```

### Render strategy

Uses `md:hidden` / `hidden md:flex` to show the right version per breakpoint, same as current filter-bar approach. The mobile collapsed/expanded toggle only affects the `md:hidden` portion.

## Markup sketch

```tsx
<>
  {/* Mobile */}
  <div className="md:hidden">
    {mobileOpen ? (
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={mobileInputRef}
          type="search"
          className="min-h-[44px] w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          ...
        />
        <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>
    ) : (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Open search"
        className={cn("rounded-full", value && "bg-accent text-accent-foreground")}
      >
        <Search className="size-4" />
      </Button>
    )}
  </div>

  {/* Desktop */}
  <div className="relative hidden min-w-[120px] flex-1 md:flex">
    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    <input
      type="search"
      className="w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-[32px]"
      ...
    />
    {value && (
      <button type="button" onClick={handleDesktopClear} ...>
        <X className="size-3.5" />
      </button>
    )}
  </div>
</>
```

## Replaces

In `filter-bar.tsx`:
- `searchOpen` state (line 38)
- `searchInputRef` and `mobileSearchInputRef` refs (lines 39-40)
- `useEffect` for auto-focus (lines 42-46)
- `handleClearSearch` handler (lines 48-54)
- `handleMobileSearchKeyDown` handler (lines 56-60)
- `handleDesktopClearSearch` handler (lines 62-64)
- `showClearButton` derived value (line 66)
- Mobile search input block (lines 73-95)
- Mobile search icon button (lines 142-154)
- Desktop search input block (lines 167-189)

Total: ~80 lines removed from FilterBar.

## Test requirements

- Desktop: renders input always visible
- Desktop: shows clear button when value is non-empty
- Desktop: clear button calls onChange with ""
- Mobile: renders search icon button when collapsed
- Mobile: shows active indicator when collapsed with non-empty value
- Mobile: expands on button click
- Mobile: auto-focuses input on expand
- Mobile: Escape collapses
- Mobile: clear when empty collapses
- Mobile: clear when non-empty clears value (stays open)
