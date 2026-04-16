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
