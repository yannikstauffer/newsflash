export interface SourceDayStats {
  appeared: number
  hidden: number
  saved: number
}

export interface FilterDayStats {
  appeared: number
  hidden: number
  saved: number
}

export interface DayStats {
  sources: Record<string, SourceDayStats>
  filters: Record<string, FilterDayStats>
}

export interface StatsStore {
  version: 1
  days: Record<string, DayStats>
}

export type StatCounter = "appeared" | "hidden" | "saved"

const STATS_KEY = "newsflash:stats"
const EVICTION_DAYS = 90

function todayIso(date?: Date): string {
  const d = date ?? new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function evictOldDays(days: Record<string, DayStats>): Record<string, DayStats> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - EVICTION_DAYS)
  const cutoffString = todayIso(cutoff)
  const evicted: Record<string, DayStats> = {}
  for (const [date, stats] of Object.entries(days)) {
    if (date >= cutoffString) {
      // eslint-disable-next-line security/detect-object-injection -- date comes from our own stored data
      evicted[date] = stats
    }
  }
  return evicted
}

export function readStats(): StatsStore {
  try {
    const raw = globalThis.localStorage.getItem(STATS_KEY)
    if (!raw) return { version: 1, days: {} }
    const parsed = JSON.parse(raw) as StatsStore
    if (parsed.version !== 1 || typeof parsed.days !== "object") {
      return { version: 1, days: {} }
    }
    return parsed
  } catch {
    return { version: 1, days: {} }
  }
}

export function writeStats(store: StatsStore): void {
  const evicted: StatsStore = {
    ...store,
    days: evictOldDays(store.days),
  }
  try {
    globalThis.localStorage.setItem(STATS_KEY, JSON.stringify(evicted))
  } catch {
    // localStorage full or unavailable
  }
}

function ensureSourceBucket(day: DayStats, sourceId: string): void {
  // eslint-disable-next-line security/detect-object-injection -- sourceId comes from our connector registry
  if (!day.sources[sourceId]) {
    // eslint-disable-next-line security/detect-object-injection
    day.sources[sourceId] = { appeared: 0, hidden: 0, saved: 0 }
  }
}

function ensureFilterBucket(day: DayStats, filterId: string): void {
  // eslint-disable-next-line security/detect-object-injection -- filterId comes from our connector registry
  if (!day.filters[filterId]) {
    // eslint-disable-next-line security/detect-object-injection
    day.filters[filterId] = { appeared: 0, hidden: 0, saved: 0 }
  }
}

export function incrementSourceStat(
  sourceId: string,
  counter: StatCounter,
  date?: Date,
): void {
  const store = readStats()
  const key = todayIso(date)
  // eslint-disable-next-line security/detect-object-injection -- key is YYYY-MM-DD from our own code
  if (!store.days[key]) {
    // eslint-disable-next-line security/detect-object-injection
    store.days[key] = { sources: {}, filters: {} }
  }
  // eslint-disable-next-line security/detect-object-injection
  const day = store.days[key]
  ensureSourceBucket(day, sourceId)
  // eslint-disable-next-line security/detect-object-injection
  day.sources[sourceId][counter]++
  writeStats(store)
}

export function incrementFilterStat(
  filterId: string,
  counter: StatCounter,
  date?: Date,
): void {
  const store = readStats()
  const key = todayIso(date)
  // eslint-disable-next-line security/detect-object-injection -- key is YYYY-MM-DD from our own code
  if (!store.days[key]) {
    // eslint-disable-next-line security/detect-object-injection
    store.days[key] = { sources: {}, filters: {} }
  }
  // eslint-disable-next-line security/detect-object-injection
  const day = store.days[key]
  ensureFilterBucket(day, filterId)
  // eslint-disable-next-line security/detect-object-injection
  day.filters[filterId][counter]++
  writeStats(store)
}
