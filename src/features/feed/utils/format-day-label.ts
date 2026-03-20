const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function formatDate(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatDayLabel(date: Date, now?: Date): string {
  const today = now ?? new Date()
  const formatted = formatDate(date)

  if (isSameDay(date, today)) {
    return `today, ${formatted}`
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, yesterday)) {
    return `yesterday, ${formatted}`
  }

  const weekday = WEEKDAYS[date.getDay()]
  return `${weekday}, ${formatted}`
}
