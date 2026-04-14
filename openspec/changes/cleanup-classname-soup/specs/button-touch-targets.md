# Spec: Button Touch-Target Sizes

## Context

WCAG 2.5.8 requires 44x44px minimum touch targets on mobile. Currently this is applied via className overrides at every call site. This spec bakes the sizing into Button's CVA variants so call sites don't need to repeat it.

## Changes to `button-variants.ts`

### `icon-xs`

```
Before: "size-6 rounded-[min(var(--radius-md),10px)] ..."
After:  "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:size-6 rounded-[min(var(--radius-md),10px)] ..."
```

Mobile: 44x44 touch target. Desktop: shrinks to 24x24 (`size-6`).

### `icon-sm`

```
Before: "size-7 rounded-[min(var(--radius-md),12px)] ..."
After:  "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:size-7 rounded-[min(var(--radius-md),12px)] ..."
```

Mobile: 44x44 touch target. Desktop: shrinks to 28x28 (`size-7`).

### `sm`

```
Before: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] ..."
After:  "min-h-[44px] md:min-h-0 md:h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] ..."
```

Mobile: 44px min-height. Desktop: shrinks to 28px (`h-7`).

### Unchanged sizes

- `default`, `lg`, `icon`, `icon-lg`, `xs` — no touch-target sizing added. These are either large enough already or used in contexts where 44px isn't needed.

## Call-site impact

After this change, remove `className` touch-target overrides from:

| File | Line(s) | Override removed |
|---|---|---|
| `article-action-buttons.tsx` | 30, 43 | `min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0` |
| `hidden-article-actions.tsx` | 23 | `min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0` |
| `read-list-page.tsx` | 110 | `min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0` |
| `filter-bar.tsx` | 118, 130 | `h-8 min-h-[44px] min-w-[44px] ... md:min-h-[28px] md:min-w-0` |
| `filter-bar.tsx` | 148 | `min-h-[44px] min-w-[44px] ...` |
| `filter-bar.tsx` | 200, 215 | `min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-[28px]` |
| `read-list-page.tsx` | 64 | `h-8 min-h-[44px] ... md:min-h-[28px]` |
