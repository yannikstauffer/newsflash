export function formatAbsoluteTime(date: Date, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date)
}

export function formatShortTime(date: Date, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatRelativeTime(date: Date, now: Date = new Date(), locale: string = "en"): string {
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (diffSeconds < 60) {
    return rtf.format(0, "second")
  }
  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, "minute")
  }
  return rtf.format(-diffHours, "hour")
}
