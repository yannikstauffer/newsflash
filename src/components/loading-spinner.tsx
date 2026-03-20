export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
