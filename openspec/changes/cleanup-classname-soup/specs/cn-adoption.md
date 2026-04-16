# Spec: `cn()` Adoption

## Scope

Replace all remaining template literal className conditionals with `cn()` calls. This is a mechanical refactor — no logic changes.

## Instances

### `swipeable-card.tsx` line 175

```tsx
// Before
className={`absolute inset-0 flex items-center rounded-lg ${swipeDirection === "right" || removalDirection === "right" ? "justify-start pl-6" : "justify-end pr-6"} ${activeConfig.bgClassName}`}

// After
className={cn(
  "absolute inset-0 flex items-center rounded-lg",
  (swipeDirection === "right" || removalDirection === "right") ? "justify-start pl-6" : "justify-end pr-6",
  activeConfig.bgClassName,
)}
```

### `sync-nav-icon.tsx` line 17

```tsx
// Before
className={`${className ?? ""} animate-spin`}

// After
className={cn(className, "animate-spin")}
```

### `feed-group.tsx` line 53

```tsx
// Before
className={`size-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}

// After
className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-90")}
```

### `article-action-buttons.tsx` line 46

```tsx
// Before
className={`size-3.5 ${isSaved ? "fill-current" : ""}`}

// After
className={cn("size-3.5", isSaved && "fill-current")}
```

## Import additions

Files that don't currently import `cn`:
- `swipeable-card.tsx` — add `import { cn } from "@/lib/utils"`
- `sync-nav-icon.tsx` — add `import { cn } from "@/lib/utils"`
- `feed-group.tsx` — add `import { cn } from "@/lib/utils"`
- `article-action-buttons.tsx` — add `import { cn } from "@/lib/utils"`
