const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

export function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()

  if (diff < MINUTE) {
    return "just now"
  }
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE)
    return `${minutes}m ago`
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR)
    return `${hours}h ago`
  }
  const days = Math.floor(diff / DAY)
  if (days === 1) {
    return "yesterday"
  }
  if (days < 30) {
    return `${days}d ago`
  }
  return date.toLocaleDateString()
}
