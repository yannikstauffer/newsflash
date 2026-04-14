# Design: Clean Up className Soup

## Architecture

All new shared components live in `src/components/`. CVA variant files live next to the components they serve. The module boundary rules are preserved: shared components cannot import from `features/` or `app/`.

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx              (unchanged)
│   │   ├── button-variants.ts      (MODIFIED — touch targets)
│   │   ├── ...
│   ├── search-input.tsx            (NEW)
│   ├── segmented-control.tsx       (NEW)
│   ├── setting-row.tsx             (NEW)
│   ├── settings-section.tsx        (NEW)
│   ├── ...
├── features/
│   ├── feed/components/
│   │   ├── article-card.tsx        (MODIFIED — uses CVA)
│   │   ├── card-variants.ts        (NEW — colocated with ArticleCard)
│   │   ├── filter-bar.tsx          (MODIFIED — uses SearchInput)
│   │   ├── ...
│   ├── feed-config/components/
│   │   ├── feed-config-page.tsx    (MODIFIED — uses shared components)
│   │   ├── feed-group.tsx          (MODIFIED — uses SettingRow)
│   │   ├── ...
│   ├── article-actions/components/
│   │   ├── article-action-buttons.tsx (MODIFIED — no more className overrides)
│   │   ├── hidden-article-actions.tsx (MODIFIED — no more className overrides)
│   │   ├── read-list-page.tsx         (MODIFIED — no more className overrides)
│   │   ├── swipeable-card.tsx         (MODIFIED — cn() adoption)
│   │   ├── ...
│   ├── sync/components/
│   │   ├── sync-settings.tsx       (MODIFIED — uses SettingsSection)
│   │   ├── sync-nav-icon.tsx       (MODIFIED — cn() adoption)
│   │   ├── ...
├── app/
│   ├── components/
│   │   └── bottom-nav.tsx          (NEW — app-shell, can import features)
│   ├── app-layout.tsx              (MODIFIED — uses BottomNav)
│   ├── ...
```

## Component Designs

### 1. Button Touch-Target Sizes (CVA modification)

**Problem:** 9 call sites override Button's className with `min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0` or similar.

**Solution:** Bake touch-target sizing into the existing Button size variants. Mobile gets the 44px minimum; desktop shrinks back down.

**Current call site:**
```tsx
<Button variant="ghost" size="icon-xs"
  className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">
```

**After:**
```tsx
<Button variant="ghost" size="icon-xs">
```

**Variant changes in `button-variants.ts`:**

| Size | Current | Add |
|---|---|---|
| `icon-xs` | `size-6` | `min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:size-6` |
| `icon-sm` | `size-7` | `min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:size-7` |
| `sm` | `h-7` | `min-h-[44px] md:min-h-0 md:h-7` |
| `default` | `h-8` | (leave as-is — not every default button needs a touch target) |

**Note:** The filter-bar buttons use a different pattern: `h-8 min-h-[44px] min-w-[44px] rounded-full px-3 text-xs md:min-h-[28px] md:min-w-0`. These combine `sm` size with `rounded-full`. After baking touch targets into `sm`, these simplify to just `className="rounded-full"`.

The day-navigation buttons use `md:min-h-[28px] md:min-w-[28px]` which matches `icon-sm` at `size-7` (28px). So `icon-sm` with baked-in touch targets covers them.

### 2. `<SettingsSection>`

**Props:**
```tsx
interface SettingsSectionProps {
  readonly title: string
  readonly description?: string
  readonly headerAction?: ReactNode   // for the enable-all/disable-all buttons
  readonly children: ReactNode
  readonly "aria-label"?: string
  readonly "data-testid"?: string
}
```

**Renders:**
```tsx
<section className="space-y-3 rounded-lg border border-border p-6" ...>
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {headerAction}
  </div>
  {children}
</section>
```

**Replaces:** 6 blocks in `feed-config-page.tsx` and `sync-settings.tsx`.

**Decision:** The `headerAction` slot handles the Sources section's "Enable all / Disable all" buttons. Sections without actions just omit the prop — the `justify-between` is harmless on a single-child flex.

### 3. `<SegmentedControl>`

**Props:**
```tsx
interface SegmentedControlProps<T extends string> {
  readonly value: T
  readonly onChange: (value: T) => void
  readonly options: ReadonlyArray<{ readonly value: T; readonly label: string }>
  readonly "aria-label": string
}
```

**Behaviour:**
- Renders `role="radiogroup"` container with `role="radio"` buttons
- Arrow left/right cycles through options (wrapping)
- Home/End jump to first/last
- Only the selected option is in tab order (`tabIndex={0}`), others are `tabIndex={-1}`
- Roving tabindex managed via internal state

**Renders:**
```tsx
<div className="inline-flex rounded-lg border border-border" role="radiogroup" aria-label={...}>
  {options.map(option => (
    <button
      role="radio"
      aria-checked={value === option.value}
      tabIndex={value === option.value ? 0 : -1}
      onClick={() => onChange(option.value)}
      onKeyDown={handleKeyDown}
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

**Replaces:** 2 identical blocks in `feed-config-page.tsx` (theme + locale pickers).

**Improvement over current:** Adds keyboard navigation (arrow keys, Home/End) which the copy-pasted buttons lack today.

### 4. `<SearchInput>`

**Props:**
```tsx
interface SearchInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly maxLength?: number
  readonly "aria-label"?: string
  readonly className?: string
}
```

**Behaviour:**
- **Desktop (md+):** Always visible. Input with search icon and conditional clear button.
- **Mobile (<md):** Shows a search icon button. When tapped, expands into the full input. Escape or clear-when-empty collapses back.
- Open/close state is **internal** — the parent only sees `value`/`onChange`.
- Auto-focuses on mobile expand.

**Internal state:**
```tsx
const [mobileOpen, setMobileOpen] = useState(false)
```

**Decision:** If the parent passes a non-empty `value` on mount, mobile starts collapsed (showing the icon button with an active indicator). This preserves the current filter-bar behaviour where the search query persists across navigations but the mobile input stays collapsed.

**Replaces:** ~60 lines + 2 refs + 3 handlers in `filter-bar.tsx`.

### 5. `<SettingRow>`

**Props:**
```tsx
interface SettingRowProps {
  readonly label: string
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
  readonly "aria-label"?: string
}
```

**Renders:**
```tsx
<div className="flex min-h-11 items-center justify-between md:min-h-0">
  <span className="text-sm text-foreground">{label}</span>
  <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={ariaLabel ?? label} />
</div>
```

**Note:** Uses `min-h-11` (44px) directly since this is a layout component, not a Button — the touch-target sizing here is intrinsic, not a Button variant concern.

**Replaces:** 5 blocks in `feed-config-page.tsx` (ungrouped feeds, filters) and `feed-group.tsx` (individual feeds).

### 6. `<BottomNav>`

**Props:**
```tsx
interface BottomNavProps {
  readonly readListCount: number
}
```

**Extracted from:** `app-layout.tsx` lines 51-92.

**Contains:**
- The `NAV_ITEMS` constant
- The `formatBadgeCount` helper
- The `<nav>` element with all its responsive classes
- The badge rendering logic

**AppLayout after extraction:**
```tsx
export function AppLayout() {
  useThemePreference()
  usePeriodicSync()
  const { readListIds } = useArticleState()

  return (
    <SyncProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col pt-[env(safe-area-inset-top)]">
        <a href="#main-content" className={skipLinkClasses}>
          {t("nav.skipToContent")}
        </a>
        <BottomNav readListCount={readListIds.length} />
        <OfflineBanner />
        <main id="main-content" className="flex-1 p-3 pb-16 sm:pb-0 md:p-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Toaster />
      </div>
    </SyncProvider>
  )
}
```

**Decision:** The skip-link's long className stays inline as a const at the top of AppLayout (it's a one-off, no value in extracting a component for it). Using `cn()` for readability.

### 7. ArticleCard CVA (`card-variants.ts`)

**Variants:**

```tsx
export const articleCardVariants = cva(
  "group relative grid gap-3 rounded-lg bg-card p-3 shadow-sm transition-all duration-150 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] md:gap-4 md:p-4",
  {
    variants: {
      hasImage: {
        true: "grid-cols-[auto_1fr]",
        false: "grid-cols-1",
      },
      dimmed: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      hasImage: false,
      dimmed: false,
    },
  },
)
```

**Call site after:**
```tsx
<article
  tabIndex={0}
  className={articleCardVariants({ hasImage: showImage, dimmed })}
>
```

**Replaces:** The 200+ char template literal in `article-card.tsx`.

### 8. `cn()` Adoption (Refactor)

Replace all remaining template literal className conditionals with `cn()`:

| File | Current | After |
|---|---|---|
| `swipeable-card.tsx:175` | `` `absolute inset-0 ... ${dir === "right" ? "justify-start pl-6" : "justify-end pr-6"} ${activeConfig.bgClassName}` `` | `cn("absolute inset-0 ...", dir === "right" ? "justify-start pl-6" : "justify-end pr-6", activeConfig.bgClassName)` |
| `sync-nav-icon.tsx:17` | `` `${className ?? ""} animate-spin` `` | `cn(className, "animate-spin")` |
| `feed-group.tsx:53` | `` `size-4 ... ${isExpanded ? "rotate-90" : ""}` `` | `cn("size-4 ...", isExpanded && "rotate-90")` |
| `article-action-buttons.tsx:46` | `` `size-3.5 ${isSaved ? "fill-current" : ""}` `` | `cn("size-3.5", isSaved && "fill-current")` |

### 9. Error Boundary Button Fix

Replace the hand-rolled `<button>` in `error-boundary.tsx:49-51` with `<Button>`:

```tsx
// Before (150-char className)
<button className="min-h-[44px] rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">

// After
<Button onClick={() => window.location.reload()}>
  {t("error.reload")}
</Button>
```

## Dependency Order

Components must be built in this order (each step depends on the previous):

```
Phase 1: Foundation (no inter-dependencies)
├── button-variants.ts modification
├── card-variants.ts (new)
├── <SettingsSection> (new)
├── <SegmentedControl> (new)
├── <SearchInput> (new)
├── <SettingRow> (new)
└── <BottomNav> (new)

Phase 2: Consumers (depend on Phase 1)
├── app-layout.tsx → uses BottomNav
├── article-card.tsx → uses card-variants
├── filter-bar.tsx → uses SearchInput, Button (touch-target baked in)
├── feed-config-page.tsx → uses SettingsSection, SegmentedControl, SettingRow
├── feed-group.tsx → uses SettingRow, cn()
├── sync-settings.tsx → uses SettingsSection
├── article-action-buttons.tsx → Button (touch-target baked in), cn()
├── hidden-article-actions.tsx → Button (touch-target baked in)
├── read-list-page.tsx → Button (touch-target baked in)
├── swipeable-card.tsx → cn()
├── sync-nav-icon.tsx → cn()
└── error-boundary.tsx → Button

Phase 3: Tests
└── Update all colocated tests for changed DOM structure
```

## Invariants

- **No visual changes.** Every pixel must render identically before and after. The refactor is purely structural.
- **No behaviour changes.** Keyboard navigation, focus management, ARIA attributes — all preserved (SegmentedControl improves keyboard nav, which is additive).
- **No new dependencies.** Everything uses existing packages (CVA, clsx, tailwind-merge).
- **Module boundaries preserved.** New shared components in `src/components/` do not import from `features/` or `app/`.
- **Test coverage maintained.** All existing tests pass (possibly with selector/structure updates). New shared components get their own colocated tests.
