function pad(value: number): string {
  return String(value).padStart(2, "0")
}

export function formatAbsoluteTime(date: Date): string {
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = date.getFullYear()
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
}

export function formatShortTime(date: Date): string {
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${day}.${month}. ${hours}:${minutes}`
}

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffSeconds < 60) {
    return "just now"
  }
  if (diffMinutes === 1) {
    return "1 min ago"
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }
  if (diffHours === 1) {
    return "1 hour ago"
  }
  return `${diffHours} hours ago`
}
