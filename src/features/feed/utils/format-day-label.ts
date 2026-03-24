function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatDayLabel(date: Date, now?: Date, locale: string = "en"): string {
  const today = now ?? new Date()
  const formatted = formatDate(date, locale)

  if (isSameDay(date, today)) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const todayLabel = rtf.format(0, "day")
    return `${todayLabel}, ${formatted}`
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, yesterday)) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const yesterdayLabel = rtf.format(-1, "day")
    return `${yesterdayLabel}, ${formatted}`
  }

  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date)
  return `${weekday.toLocaleLowerCase(locale)}, ${formatted}`
}
