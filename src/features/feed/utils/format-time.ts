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
