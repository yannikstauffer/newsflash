import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

interface RefreshButtonProps {
  readonly loading: boolean
  readonly onClick: () => void
}

export function RefreshButton({ loading, onClick }: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading}
      aria-label="Refresh feeds"
      className="h-8 rounded-full px-3 text-xs"
    >
      <RefreshCw
        className={`size-3.5 ${loading ? "animate-spin" : ""}`}
        data-icon="inline-start"
      />
      {"Refresh"}
    </Button>
  )
}
