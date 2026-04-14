# Spec: ArticleCard CVA Variants

## Location

`src/features/feed/components/card-variants.ts` (colocated with `article-card.tsx`)

## Variants

```tsx
import { cva } from "class-variance-authority"

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

## Usage in `article-card.tsx`

```tsx
import { articleCardVariants } from "./card-variants"

// In render:
<article
  tabIndex={0}
  className={articleCardVariants({
    hasImage: Boolean(article.imageUrl) && !imageError,
    dimmed,
  })}
>
```

## Replaces

The 200+ character template literal in `article-card.tsx` line 27-29:

```tsx
// Before
className={`group relative grid ${article.imageUrl && !imageError ? "grid-cols-[auto_1fr]" : "grid-cols-1"} gap-3 rounded-lg bg-card p-3 shadow-sm transition-all duration-150 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] md:gap-4 md:p-4 ${dimmed ? "opacity-50" : ""}`}

// After
className={articleCardVariants({ hasImage: showImage, dimmed })}
```

## No tests needed

This is a pure class-string generator. It's tested implicitly through `article-card.test.tsx` which verifies the rendered output.
